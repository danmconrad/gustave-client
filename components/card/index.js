'use strict';

import React, {Component, StyleSheet, View, Animated, Easing} from 'react-native';

export default class Card extends Component {

  static propTypes = {
    style: View.propTypes.style,
    minHeight: React.PropTypes.number,
  };

  state = {
    enterAnimation: new Animated.Value(0),
    cardHeight: this.props.minHeight,   // Only used to set initial, out of sync is intentional
  };

  attributes = {
    animationFinished: false,
    contentHeight: 0,
  };

  componentDidMount() {
    Animated.timing(this.state.enterAnimation, {
      toValue: 1,
      duration: 250,
      easing: Easing.elastic(1),
    }).start(() => {
      this.attributes.animationFinished = true;
      this.checkOverflow();
    });
  }

  checkOverflow(event) {
    if (!this.props.minHeight > 0) return;

    if (event)
      this.attributes.contentHeight = event.nativeEvent.layout.height;

    if (!this.attributes.animationFinished) return;

    let contentHeight = this.attributes.contentHeight;
    let minHeight = this.props.minHeight;

    if (contentHeight > minHeight && this.state.cardHeight !== contentHeight)
      this.setState({cardHeight: contentHeight});
    else if (this.state.cardHeight !== minHeight)
      this.setState({cardHeight: minHeight}) 

  }

  render() {
    return (
      <View style={[this.props.minHeight && {height: this.state.cardHeight}]}>
        <Animated.View 
          style={[
            styles.card, 
            this.props.minHeight && styles.flexFull,
            this.props.style, 
            {transform: [{scale: this.state.enterAnimation}], opacity: this.state.enterAnimation},
          ]}>
            <View onLayout={this.checkOverflow.bind(this)}>
              {this.props.children}
            </View>
        </Animated.View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  flexFull : {
    flex: 1,
  },

  card: {
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    backgroundColor: '#fff',
    // Shadow won't work with overflow hidden, which is required for jumbotron image corners to match card corner
    overflow: 'hidden'
  },

});
