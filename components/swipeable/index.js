'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
} from 'react-native';

import Edge from './edge';


const SWIPE_V_THRESHOLD = 1;
const IS_SWIPING_OPACITY = 0.8;

const RESET_TO_ZERO_PROPS = {
  toValue: 0,
  duration: 250,
  easing: Easing.easeInEaseOut,
};


export default class Swipeable extends Component {

  static propTypes = {
    onSwipeLeft: React.PropTypes.func,
    onSwipeRight: React.PropTypes.func,
    leftSwipeEdge: React.PropTypes.node,
    rightSwipeEdge: React.PropTypes.node,
    onSwipeStart: React.PropTypes.func,
    onSwipeEnd: React.PropTypes.func,
    pinThresholdLeft: React.PropTypes.number,
    pinThresholdRight: React.PropTypes.number,
    pinOffsetLeft: React.PropTypes.number,
    pinOffsetRight: React.PropTypes.number,
    snapBack: React.PropTypes.bool,
    style: View.propTypes.style,
    onLayout: React.PropTypes.func,
  };

  static defaultProps = {
    snapBack: true,
  };

  state = {
    offsetX: new Animated.Value(0),
    left: new Animated.Value(0),
    right: new Animated.Value(0),
    edgeHeight: 0,
    isSwiping: false,
  };

  attributes = {
    height: 0,
    width: 0,
  };

  handleLayout(event) {
    let layout = event.nativeEvent.layout;
    this.attributes.width = layout.width;
    this.attributes.height = layout.height;
    if (this.props.onLayout) 
      this.props.onLayout(event);
  }

  componentWillUnmount() {
    this.state.offsetX.removeListener(this._offsetXListener);
  }

  componentWillMount() {
    this._offsetXListener = this.state.offsetX.addListener(({value}) => {
      this.props.rightSwipeEdge && this.state.left.setValue(Math.abs(Math.max(value, 0)));
      this.props.leftSwipeEdge && this.state.right.setValue(Math.abs(Math.min(value, 0)));
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: this.getWantsControl.bind(this),
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: this.onSwipeStart.bind(this),
      onPanResponderMove: this.onSwipeStep.bind(this),
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: this.onRelease.bind(this),
      onPanResponderTerminate: this.onTerminate.bind(this),
      onShouldBlockNativeResponder: () => true,
    });
  }

  getWantsControl(event, gestureState) {
    let isSwipingUpDown = Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
                        || Math.abs(gestureState.vy) > Math.abs(gestureState.vx);

    if (isSwipingUpDown) return false;

    let isSwipingLeft = gestureState.dx < 0 ;
    let isSwipingRight = gestureState.dx > 0;


    let hasLeftHandler = Boolean(this.props.onSwipeLeft);
    let hasRightHandler = Boolean(this.props.onSwipeRight);

    let doesPinLeft = this.props.pinOffsetLeft > 0;
    let doesPinRight = this.props.pinOffsetRight > 0;

    return (hasLeftHandler && isSwipingLeft)
      || (hasRightHandler && isSwipingRight)
      || (this._isStuck && doesPinLeft && isSwipingRight)
      || (this._isStuck && doesPinRight && isSwipingLeft);
  }

  onSwipeStart(event, gestureState) {
    this.setState({isSwiping: true});
    this.props.onSwipeStart && this.props.onSwipeStart();

    this.state.offsetX.stopAnimation((value) => {
      this.state.offsetX.setOffset(value);
      this.state.offsetX.setValue(0);
      this._lastOffsetX = value;
    });
  }

  onSwipeStep(event, gestureState) {
    if (this.isViolatingSwipeability(gestureState)) {
      this.reset();
    } else {
      this.state.offsetX.setValue(gestureState.dx);
    }
  }

  isViolatingSwipeability(gestureState) {
    let canHandleSwipeRight = Boolean(this.props.onSwipeRight);
    let canHandleSwipeLeft = Boolean(this.props.onSwipeLeft);

    if (canHandleSwipeLeft && canHandleSwipeRight)
      return false;

    let isAttempingToSwipeLeft = this._lastOffsetX + gestureState.dx < 0;

    if (isAttempingToSwipeLeft && !canHandleSwipeLeft)
      return true;

    let isAttempingToSwipeRight = this._lastOffsetX + gestureState.dx > 0;

    if (isAttempingToSwipeRight && !canHandleSwipeRight)
      return true;

    return false;
  }

  onSwipeLeft(event, gestureState) {
    this.onSwipe(-1, this.props.onSwipeLeft, event, gestureState);
  }

  onSwipeRight(event, gestureState) {
    this.onSwipe(1, this.props.onSwipeRight, event, gestureState);
  }

  onSwipe(directionCoef, onSwipeHook, event, gestureState) {
    this.state.offsetX.flattenOffset();
    this.state.offsetX.stopAnimation((offset) => {
      let toValue = Dimensions.get('window').width * directionCoef;
      let duration = Math.abs(offset) / Math.abs(gestureState.vx);

      Animated.timing(this.state.offsetX, {toValue, duration}).start(() => {
        onSwipeHook && onSwipeHook();
      });
    });
  }

  onRelease(event, gestureState) {
    this.setState({isSwiping: false});
    this.props.onSwipeEnd && this.props.onSwipeEnd();

    if (gestureState.vx >= SWIPE_V_THRESHOLD) {
      return this.onSwipeRight(event, gestureState);
    } else if (gestureState.vx <= -SWIPE_V_THRESHOLD) {
      return this.onSwipeLeft(event, gestureState);
    }

    if (this.getIsPinable()) {
      this.handleStickiness(event, gestureState);

    } else if (this.props.snapBack) {
      this.animatedResetToValue();
    }
  }

  onTerminate(event, gestureState) {
    if (this.state.isSwiping) {
      this.setState({isSwiping: false});
      this.props.onSwipeEnd && this.props.onSwipeEnd();
    }

    this.animatedResetToValue();
  }

  getIsPinable() {
    return Boolean(this.props.pinThresholdLeft) || Boolean(this.props.pinThresholdRight);
  }

  handleStickiness(event, gestureState) {
    if (this._isStuck) {
      this._isStuck = false;
      this.animatedResetToValue();
    } else{
      let pinThreshold = gestureState.dx > 0 ? this.props.pinThresholdRight : this.props.pinThresholdLeft;
      let shouldStick = Math.abs(gestureState.dx) > this.attributes.width * pinThreshold;

      if (!shouldStick)
        return this.animatedResetToValue();

      this._isStuck = true;

      let rightOffset = this.props.pinOffsetRight;
      let leftOffset = -this.props.pinOffsetLeft;
      let offset = gestureState.dx > 0 ? rightOffset : leftOffset;

      this.animatedResetToValue(offset);
    }
  }

  reset() {
    this.state.offsetX.setOffset(0);
    this.state.offsetX.setValue(0);
  }

  animatedResetToValue(toValue) {
    toValue = toValue || RESET_TO_ZERO_PROPS.toValue;
    this.state.offsetX.flattenOffset();
    Animated.timing(this.state.offsetX, {...RESET_TO_ZERO_PROPS, toValue}).start();
  }

  setEdgeHeight(event) {
    let {height: edgeHeight} = event.nativeEvent.layout;
    if (edgeHeight !== this.state.edgeHeight) {
      this.setState({edgeHeight});
    }
  }

  render() {

    let swipeAnimations = {
      opacity: this.state.isSwiping && IS_SWIPING_OPACITY || 1,
      transform: [
        {translateX: this.state.offsetX},
      ],
    };

    return (
      <View onLayout={this.setEdgeHeight.bind(this)} style={this.props.style}>

        {this.props.rightSwipeEdge &&
          <Edge
            containerHeight={this.state.edgeHeight}
            position={'left'}
            thickness={this.state.left}>
            {this.props.rightSwipeEdge}
          </Edge>
        }

        {this.props.leftSwipeEdge &&
          <Edge
            containerHeight={this.state.edgeHeight}
            position={'right'}
            thickness={this.state.right}>
            {this.props.leftSwipeEdge}
          </Edge>
        }

        <Animated.View 
            onLayout={this.handleLayout.bind(this)} 
            style={[swipeAnimations, styles.innerContent]} 
            {...this.panResponder.panHandlers} >

          {this.props.children}

        </Animated.View>

      </View>
    );
  }
}

var styles = StyleSheet.create({
  innerContent: {
    flex: 1,
  },
});
