import React, {
  Animated,
  Component,
  Dimensions,
  Easing,
  InteractionManager,
  LayoutAnimation,
  ListView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TimerMixin from 'react-timer-mixin';
import Icon from 'react-native-vector-icons/MaterialIcons';

import _ from 'lodash';
import Immutable from 'immutable';

import Card from '../card';
import Swipeable from '../swipeable';
import Recommendation from '../recommendation';

const PAGING_MARGIN = 0.25;

export default class RecommendationsScene extends Component {
  static contextTypes = {
    theme: React.PropTypes.object,
    database: React.PropTypes.object,
    user: React.PropTypes.object,
  };

  static propTypes = {
    recommendations: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    /*
        onToggleSaved(object recommendationID, bool newSaveState)

        Will be called whenever a recommendation is saved or unsaved with the recommendation
        id and the new saved state.
    */
    onToggleSaved: React.PropTypes.func,
    onServiceAction: React.PropTypes.func.isRequired,
  };

  state = {
    datasource: new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    }),
    isRefreshing: false,
    removedRecommendations: Immutable.Set(),
    showDetails: Immutable.Set(),
    rowHeights: Immutable.List(),
    current: Immutable.Map({
      index: 0, 
      top: 0,
      bottom: 0,
    }),
  };

  hasActiveRows() {
    return this.props.recommendations.length - this.state.removedRecommendations.size > 0;
  }

  getLastActiveRowIndex() {
    if (!this.hasActiveRows)
      return -1;

    return _.findLastIndex(this.props.recommendations, (rec) => !this.state.removedRecommendations.has(rec.id));
  }

  toggleDetails(recommendationID, rowID) {
    let wasShowingDetails = this.state.showDetails.has(recommendationID);
    let currentIndex = this.state.current.get('index');

    let _actuallyToggleDetails = () => {
      if (wasShowingDetails)
        this.setState({showDetails: this.state.showDetails.delete(recommendationID)});
      else
        this.setState({showDetails: this.state.showDetails.add(recommendationID)});
    };

    if (wasShowingDetails && currentIndex === Number(rowID)) {
      this._scrollTo(this.state.current.get('top'), true, () => {
        _actuallyToggleDetails(wasShowingDetails, recommendationID, rowID);
      });
    } 
    else {
      _actuallyToggleDetails(wasShowingDetails, recommendationID, rowID);
    }
  }

  removeRecommendation(recommendationID) {
    this.context.database.dismissUserRecommendation(this.context.user.id, recommendationID);
    this.setState({removedRecommendations: this.state.removedRecommendations.add(recommendationID)});
  }

  onSwipeLeft(rowID, recommendationID) {
    let scale = this._animations.get(rowID).get('scale');

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 200,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 400,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(scale, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.quad)
      }),
    ]).start(() => {
      let top = this.state.current.get('top');

      if (Number(rowID) === this.getLastActiveRowIndex())
        return this._scrollTo(top - this.state.viewportHeight, true, () => 
          this.removeRecommendation(recommendationID));

      this._scrollTo(top, false, () => {
        LayoutAnimation.easeInEaseOut();
        this.removeRecommendation(recommendationID);
      });
    }); 
  }

  onSwipeStart(rowID) {
    this._setSwipeEdgeOffset(rowID);
    this.refs['recList'].setNativeProps({canCancelContentTouches: false});
  }

  onSwipeEnd() {
    this.refs['recList'].setNativeProps({canCancelContentTouches: true});
  }

  /* List view functions */
  onListViewLayout(event) {
    LayoutAnimation.easeInEaseOut();
    this.setState({viewportHeight: event.nativeEvent.layout.height});
  }

  onRowLayout(rowID, event) {
    let index = Number(rowID);
    let height = event.nativeEvent.layout.height;

    this.setState({rowHeights: this.state.rowHeights.set(index, height)});

    this._checkCurrent({scrollOffset: this.refs['recList'].scrollProperties.offset});
  }

  renderRow(recommendation, sectionID, rowID) {
    if (this.state.removedRecommendations.has(recommendation.id))
      return (<View onLayout={this.onRowLayout.bind(this, rowID)}/>);

    let anim = new Map();
    anim.set('scale', new Animated.Value(1));
    anim.set('offset', new Animated.Value(0));

    this._animations.set(rowID, anim);

    let animStyles = {
      transform: [{scale: anim.get('scale')}],
      marginTop: anim.get('offset'),
      height: this.state.viewportHeight,
    };

    let swipeableProps = {
      leftSwipeEdge: <Icon name="close" size={60} style={{color: 'darkred'}}/>,
      onSwipeLeft: this.onSwipeLeft.bind(this, rowID, recommendation.id),
      edgeStyle: animStyles,
      onSwipeStart: this.onSwipeStart.bind(this, rowID),
      onSwipeEnd: this.onSwipeEnd.bind(this, rowID),
    };

    let shouldFill = !this.state.showDetails.has(recommendation.id);

    return (
      <Swipeable 
        style={shouldFill && {height: this.state.viewportHeight}}
        onLayout={this.onRowLayout.bind(this, rowID)}
        {...swipeableProps}>
        <Card 
          style={shouldFill && styles.flexFull}>
          <Recommendation 
            style={shouldFill && styles.flexFull}
            recommendation={recommendation}
            showDetails={this.state.showDetails.has(recommendation.id)}
            onToggleDetails={this.toggleDetails.bind(this, recommendation.id, rowID)}
            onToggleSaved={this.props.onToggleSaved}
            onServiceAction={this.props.onServiceAction} />
        </Card>
      </Swipeable>
    );
  }

  onRefresh() {
    //TO DO: make this fetch a fresh set of recommendations from the database
    this.setState({
      isRefreshing: true,
    });
    this.setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        isRefreshing: false,       
        removedRecommendations: this.state.removedRecommendations.clear(),
        showDetails: this.state.showDetails.clear(),
      });
    }, 2000);
  }

  // Always fired
  onScroll(event) {
    let scrollOffset = event.nativeEvent.contentOffset.y; 
    let lastEffectiveBottom = this.refs['recList'].scrollProperties.contentLength - this.state.viewportHeight;

    if (scrollOffset < 0 || scrollOffset > lastEffectiveBottom || Number.isFinite(this._dragStart) || this.state.isRefreshing || Number.isFinite(this._autoScrolling))
      return;

    this._checkOverscroll(scrollOffset);
  }

  onScrollBeginDrag(event) {
    this._dragStart = event.nativeEvent.contentOffset.y;
  }

  onScrollEndDrag(event) {
    let dragEnd = event.nativeEvent.contentOffset.y;
    let lastEffectiveBottom = this.refs['recList'].scrollProperties.contentLength - this.state.viewportHeight;

    if (dragEnd < 0 || dragEnd > lastEffectiveBottom)
      return delete this._dragStart;

    let dragStart = this._dragStart;
    let dy = dragEnd - dragStart;
    let vy = event.nativeEvent.velocity.y;

    this._checkShouldPage({scrollOffset: dragEnd, dy, vy});

    // This blocks scroll check, so don't delete it until after we're done with all drag logic
    delete this._dragStart;
  }

  // Fired only when scroll != drag; !fired for animated:false scrolls
  onScrollAnimationEnd(event) {
    let scrollOffset = event.nativeEvent.contentOffset.y;

    if (_aboutEqual(scrollOffset, this._autoScrolling)) {
      let callback = this._autoCallback;
      delete this._autoCallback;
      delete this._autoScrolling;
      callback && callback(scrollOffset);
    }
  }

  /* Private methods */
  _scrollTo(y, animated, callback) {
    if(!animated) {
      this._scroll(y, false);

      let interval;
      return interval = this.setInterval(() => {
        let scrollOffset = this.refs['recList'].scrollProperties.offset;

        if (!_aboutEqual(scrollOffset, y))
          return;

        this.clearInterval(interval);
        callback && callback(y);
      }, 100);
    }

    this._autoScrolling = y;
    this._autoCallback = callback;
    this._scroll(y, true);
  }

  _scroll(y, animated) {
    this.refs['recList'].scrollTo({y, animated});
  }

  _checkCurrent({scrollOffset, isScrollingDown = true, margin = 0}) {
    let index = 0, top = 0, bottom = 0;

    for (let i = 0, len = this.state.rowHeights.size; i < len; i++) {
      let height = this.state.rowHeights.get(i);

      if (!height)
        continue;

      index = i;
      top = bottom,
      bottom = top + height;
      eBottom = bottom - this.state.viewportHeight;

      if (!isScrollingDown && scrollOffset < bottom - margin)
        break;

      if (isScrollingDown && scrollOffset <= eBottom + margin)
        break;
    }

    let newCurrent = {index, top, bottom};
    this.setState({
      current: this.state.current.merge({...newCurrent})
    });

    return newCurrent;
  }

  _checkShouldPage({scrollOffset, dy, vy}) {
    let isScrollingDown = dy >= 0 || vy >= 0;
    let margin = Math.abs(vy) > 1 ? 0 : this.state.viewportHeight * PAGING_MARGIN;

    // We can save some processing if we're scolling inside an expanded card
    let lastCurrentIndex = this.state.current.get('index');
    let isExpanded = this.state.rowHeights.get(lastCurrentIndex) > this.state.viewportHeight;

    if (isExpanded) {
      let top = this.state.current.get('top');
      let bottom = this.state.current.get('bottom');
      let eBottom = this.state.current.get('bottom') - this.state.viewportHeight;
      let isScrollingWithin = scrollOffset >= top && scrollOffset <= eBottom;
      if (isScrollingWithin)
        return;
    }

    let {index, top, bottom} = this._checkCurrent({scrollOffset, isScrollingDown, margin});
    let didChange = lastCurrentIndex !== index;
    let eBottom = bottom - this.state.viewportHeight;

    let scrollTarget;

    if (!didChange && isScrollingDown)
      scrollTarget = eBottom;      

    if (!didChange && !isScrollingDown)
      scrollTarget = top; 

    if (didChange && isScrollingDown)
      scrollTarget = top; 

    if (didChange && !isScrollingDown)
      scrollTarget = eBottom; 

    this._scrollTo(scrollTarget, true);
  }

  _checkOverscroll(scrollOffset) {
    let top = this.state.current.get('top');
    let bottom = this.state.current.get('bottom');

    let isPastTop = scrollOffset < top;

    if (isPastTop)
      return this._scrollTo(top, true);

    let eBottom = bottom - this.state.viewportHeight;
    let isPastBottom = scrollOffset > eBottom;

    if (isPastBottom)
      return this._scrollTo(eBottom, true);
  }

  _setSwipeEdgeOffset(rowID) {
    this._animations.get(rowID).get('offset').setValue(this.refs['recList'].scrollProperties.offset - this.state.current.get('top')); 
  }

  /* React component lifecycle */
  constructor(props) {
    super(props);

    // This is not in state because this is updated during a render function and infinite loops are bad... mkay?
    this._animations = new Map();

    //TimerMixin
    this.setTimeout = TimerMixin.setTimeout.bind(this);
    this.clearTimeout = TimerMixin.clearTimeout.bind(this);
    this.setInterval = TimerMixin.setInterval.bind(this); 
    this.clearInterval = TimerMixin.clearInterval.bind(this); 
    this.setImmediate = TimerMixin.setImmediate.bind(this); 
    this.clearImmediate = TimerMixin.clearImmediate.bind(this);
  }

  componentWillUnmount() {
    TimerMixin.componentWillUnmount.call(this);
  }

  // Since everything in state is immutable, we can use this to improve performance
  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  render() {
    let isEmpty = !this.hasActiveRows();
    let emptyState =
      <Text style={styles.emptyText}>No recommendations available.</Text>;

    return (
      isEmpty ?
      /* Empty view */
      <View style={[styles.flexFull, styles.empty]}>{emptyState}</View> :

      /* Default view */
      <ListView ref='recList'
        style={[styles.flexFull, this.props.style]}
        onLayout={this.onListViewLayout.bind(this)}
        // Guard on datasource prevents render until proper height can be set
        dataSource={this.state.datasource.cloneWithRows(this.state.viewportHeight > 0 && this.props.recommendations)}
        renderRow={this.renderRow.bind(this)}
        directionalLockEnabled={true}
        initialListSize={1}
        onScroll={this.onScroll.bind(this)}
        onScrollBeginDrag={this.onScrollBeginDrag.bind(this)}
        onScrollEndDrag={this.onScrollEndDrag.bind(this)}
        onScrollAnimationEnd={this.onScrollAnimationEnd.bind(this)}
        onMomentumScrollEnd={this.onScrollAnimationEnd.bind(this)}
        pageSize={1}
        refreshControl={ 
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this.onRefresh.bind(this)}
            tintColor="#000000"
            title="Refreshing recommendations..."
            colors={['#ff0000', '#00ff00', '#0000ff']}
            progressBackgroundColor="#ffff00"/>
        }
        removeClippedSubviews={true}
        scrollEventThrottle={1}
        scrollRenderAheadDistance={1}
        showsVerticalScrollIndicator={false}
      />
    );
  }
}

var styles = StyleSheet.create({
  flexFull: {
    flex: 1,
  },

  flexNone: {
    flex: 0,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    textAlign: 'center',
  },
});

// Because floating point equality sucks
function _aboutEqual(a, b) {
  let Epsilon = 0.001;
  return (Math.abs(a-b) < Epsilon);
}
