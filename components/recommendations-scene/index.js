'use strict';

import React, {
  Animated,
  Component,
  Easing,
  InteractionManager,
  LayoutAnimation,
  ListView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import _ from 'lodash';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Card from '../card';
import Swipeable from '../swipeable';
import Recommendation from '../recommendation';


export default class RecommendationsScene extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
    user: React.PropTypes.object,
    database: React.PropTypes.object,
  };

  static propTypes = {
    style: View.propTypes.style,
    recommendations: React.PropTypes.arrayOf(React.PropTypes.object),
    onRecommendationAction: React.PropTypes.func,
  };

  static defaultProps = {
    recommendations: [],
  };

  state = {
    datasource: new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    }),
    viewportHeight: 0,
    isRefreshing: false,
  };

  attributes = {
    currentHeights: [],
    isExpanded: {},
    isRemoved: {},
    removeAnimations: {},
    scroll: {
      dy: 0,
      vy: 0,
      lastOffset: 0,
      dragOffset: 0,
      auto: null,
      autoCallback: null,
      isDragging: false,
    },
    currentTop: 0,
    currentBottom: 0,
    current: 0,
  };

  updateRowHeight(rowID, event) {
    let height = event.nativeEvent.layout.height;
    this.attributes.currentHeights[Number(rowID)] = height;
    this.checkCurrent();
  }

  onRemoveRow(rowID, recommendationID) {
    this.attributes.isRemoved[recommendationID] = true;
    this.attributes.currentHeights[Number(rowID)] = 0;
    this.checkCurrent();
  }

  willToggleExpanded(recID, willBeExpanded) {
    if (!willBeExpanded)
      this._scrollTo(this.attributes.currentTop);

    this.attributes.isExpanded[recID] = willBeExpanded;
  }

  didToggleExpanded() {
    this._scrollTo(this.attributes.currentTop, false);
  }

  onScroll(event) {
    let scrollOffset = event.nativeEvent.contentOffset.y;
    if (scrollOffset < 0) return; // Handled by refresh control

    if (this.attributes.scroll.isDragging)
      return (this.attributes.scroll.dy = scrollOffset - this.attributes.scroll.lastOffset);
    
    this.attributes.scroll.lastOffset = scrollOffset;

    let isAutoScrolling = Number.isFinite(this.attributes.scroll.auto);
    let hasReachedAutoTarget = isAutoScrolling && scrollOffset === this.attributes.scroll.auto;

    if (isAutoScrolling && !hasReachedAutoTarget) return;

    if (hasReachedAutoTarget) {
      this.attributes.scroll.auto === null;
      this.attributes.scroll.autoCallback && this.attributes.scroll.autoCallback();
      this.attributes.scroll.autoCallback = null;
      this.checkCurrent();
    }

    this.checkOverscroll();

    if (this.attributes.scroll.autoHandle)
      this.attributes.scroll.autoHandle = null;
  }

  onScrollBeginDrag(event) {
    this.attributes.scroll.isDragging = true
    this.attributes.scroll.dy = 0;
    this.attributes.scroll.auto = null;
  }

  onScrollEndDrag(event) {
    this.attributes.scroll.isDragging = false;
    this.attributes.scroll.dragOffset = event.nativeEvent.contentOffset.y;
    this.attributes.scroll.vy = event.nativeEvent.velocity.y;
    this.checkShouldDoPaging(event);
  }

  _scrollTo(y, animated = true, callback) {
    if (!this.refs['recList'])
      return;

    if (animated)
      this.attributes.scroll.auto = y;
    if (animated && callback)
      this.attributes.scroll.autoCallback = callback;

    this.refs['recList'].scrollTo({y, animated});
  }

  checkCurrent(scrollOffset = this.attributes.scroll.lastOffset, isScrollingDown = true, margin = 0) {
    if (this.state.isRefreshing || !this.refs['recList']) return;

    let heights = this.attributes.currentHeights;

    let current, top, bottom, eBottom;

    for (let i = 0, len = heights.length; i < len; i++) {

      let height = heights[i];

      if (!height)
        continue;

      current = i;
      top = bottom || 0;
      bottom = top + height;
      eBottom = bottom - this.state.viewportHeight;

      if (!isScrollingDown && scrollOffset < bottom - margin)
        break;

      if (isScrollingDown && scrollOffset <= eBottom + margin)
        break;
    }

    this.attributes.currentTop = top;
    this.attributes.currentBottom = bottom;
    this.attributes.current = current;

    return {current, top, bottom, eBottom};
  }

  currentIsLastActiveRow() {
    let lastActiveRow = _.findLastIndex(this.props.recommendations, (rec) => !this.attributes.isRemoved[rec.id]);
    return this.attributes.current === lastActiveRow;
  }

  hasActiveRows() {
    return this.props.recommendations && _.some(this.props.recommendations, (rec) => !this.attributes.isRemoved[rec.id]);
  }

  checkShouldDoPaging() {
    if (this.state.isRefreshing || !this.refs['recList']) return;

    let scrollOffset = this.attributes.scroll.lastOffset = this.attributes.scroll.dragOffset;
    let contentLength = this.refs['recList'].scrollProperties.contentLength;
    let lastEffectiveBottom = contentLength - this.state.viewportHeight;

    if (scrollOffset < 0 || scrollOffset > lastEffectiveBottom) return;

    let scrollVelocity = this.attributes.scroll.vy;
    let isScrollingDown = this.attributes.scroll.dy > 0;

    let margin = Math.abs(scrollVelocity) > 1 ? 0 : this.state.viewportHeight * 0.25;

    let previous = this.attributes.current;
    let {current, top, bottom, eBottom} = this.checkCurrent(scrollOffset, isScrollingDown, margin);

    let isExpanded = this.attributes.currentHeights[current] > this.state.viewportHeight;
    let isScrollingWithin = isExpanded && scrollOffset > top - margin.top && scrollOffset < eBottom - margin.bottom;

    if (isScrollingWithin || previous === current)
      return this.checkOverscroll();

    let edge = isScrollingDown ? top : eBottom;
    this._scrollTo(edge);
  }

  checkOverscroll() {
    if (this.state.isRefreshing || !this.refs['recList']) return;

    let scrollOffset = this.attributes.scroll.lastOffset;
    let contentLength = this.refs['recList'].scrollProperties.contentLength;
    let lastEffectiveBottom = contentLength - this.state.viewportHeight;

    if (scrollOffset < 0 || scrollOffset > lastEffectiveBottom) return;

    let isScrollingDown = this.attributes.scroll.dy > 0;
    let eBottom = this.attributes.currentBottom - this.state.viewportHeight;

    if (isScrollingDown && scrollOffset > eBottom)
      this._scrollTo(eBottom);
    else if (!isScrollingDown && scrollOffset < this.attributes.currentTop)
      this._scrollTo(this.attributes.currentTop);
  }


  /* 
    We intentionally do not request an updated list from the server with every swipe.
    Instead, we scroll to an available recommendation and then stop rendering the 
    dismissed recommendation until next explicit update.
  */
  didSwipeLeft(rowID, recommendationID) {
    let scrollTo;
    let scrollToLast;

    if (this.currentIsLastActiveRow())
      scrollToLast = this.attributes.currentTop - this.state.viewportHeight;
    else
      scrollTo = this.attributes.currentTop;

    Animated.sequence([
      Animated.timing(this.attributes.removeAnimations[rowID].scale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(this.attributes.removeAnimations[rowID].scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(this.attributes.removeAnimations[rowID].scale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(this.attributes.removeAnimations[rowID].scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.quad)
      }),
    ]).start(() => {
      this.onRemoveRow(rowID, recommendationID);
      this.context.database.dismissUserRecommendation(this.context.user.id, recommendationID);
      
      // If there aren't any active rows, there ain't shit to scroll to
      if (!this.hasActiveRows())
        return this.forceUpdate();

      if (Number.isFinite(scrollToLast))
        return this._scrollTo(scrollToLast, true, () => this.forceUpdate());

      this._scrollTo(scrollTo, false);
      LayoutAnimation.easeInEaseOut();
      this.forceUpdate();
    });
  }

  renderRow(recommendation, sectionID, rowID) {

    if (this.attributes.isRemoved[recommendation.id])
      return (null);

    this.attributes.removeAnimations[rowID] = {
      scale: new Animated.Value(1),
      offset: new Animated.Value(0),
    };

    let anim = {transform: [{scale: this.attributes.removeAnimations[rowID].scale}, {translateY: this.attributes.removeAnimations[rowID].offset}]};

    let swipeableProps = {
      /* 
        We infer user feedback rather than ask for it explictly, b/c behavioral studies have shown
        that asking a user to give explicit feedback results in users attempting to provide OBJECTIVE
        feedback rather than SUBJECTIVE enjoyment. 

        See e.g., Netflix
      */
      leftSwipeEdge: <Animated.View style={anim}><Icon name="close" size={60} style={{color: 'darkred'}}/></Animated.View>,
      onSwipeLeft: this.didSwipeLeft.bind(this, rowID, recommendation.id),
      // This next bit is faster than trigger a rerender
      onSwipeStart: () => this.refs['recList'].setNativeProps({canCancelContentTouches: false}),
      onSwipeEnd: () => this.refs['recList'].setNativeProps({canCancelContentTouches: true}),
    };

    let shouldStartDetailed = Boolean(this.attributes.isExpanded[recommendation.id]);

    return (
      <Swipeable key={recommendation.id} {...swipeableProps}>
        <ExpandableRecommendation key={recommendation.id}
          collapsedHeight={this.state.viewportHeight}
          didToggleExpanded={this.didToggleExpanded.bind(this)}
          onLayout={this.updateRowHeight.bind(this, rowID)}
          onRecommendationAction={this.props.onRecommendationAction}
          onRemove={this.onRemoveRow.bind(this, rowID, recommendation.id)}
          recommendation={recommendation}
          shouldStartDetailed={shouldStartDetailed}
          willToggleExpanded={this.willToggleExpanded.bind(this)}/>
      </Swipeable>
    );
  }

  onRefresh() {
    this.setState({isRefreshing: true});
    console.log('oh so refreshing!'); // Presumably we'd do more than write a cheesy logout and set a timeout
    setTimeout(this.stopRefreshing.bind(this), 2000);
  }
  stopRefreshing() {
    this.setState({isRefreshing: false})
    this._scrollTo(0);
  }

  handleListViewLayout(event) {
    LayoutAnimation.easeInEaseOut();
    this.setState({viewportHeight: event.nativeEvent.layout.height});
  }

  render() {
    let emptyState =
      <Text style={styles.emptyText}>No recommendations available.</Text>;


    return (
      !this.hasActiveRows() ?
      /* Empty view */
      <View style={[styles.flexFull, styles.empty]}>{emptyState}</View> :

      /* Default view */
      <ListView ref='recList'
        style={[styles.flexFull, this.props.style]}
        onLayout={this.handleListViewLayout.bind(this)}
        // Guard on datasource prevents render until proper height can be set
        dataSource={this.state.datasource.cloneWithRows(this.state.viewportHeight && this.props.recommendations)}
        renderRow={this.renderRow.bind(this)}
        canCancelContentTouches={true}
        directionalLockEnabled={true}
        initialListSize={1}
        onScroll={this.onScroll.bind(this)}
        onScrollBeginDrag={this.onScrollBeginDrag.bind(this)}
        onScrollEndDrag={this.onScrollEndDrag.bind(this)}
        pageSize={1}
        refreshControl={ 
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this.onRefresh.bind(this)}
            tintColor="#000000"
            title="Fetching new recommendations..."
            colors={['#ff0000', '#00ff00', '#0000ff']}
            progressBackgroundColor="#ffff00"/>
        }
        removeClippedSubviews={true}
        scrollEventThrottle={1}
        scrollRenderAheadDistance={this.state.viewportHeight}
        showsVerticalScrollIndicator={false}
      />
    );
  }
}

class ExpandableRecommendation extends Component {

  static propTypes = {
    collapsedHeight: React.PropTypes.number.isRequired,
    onLayout: React.PropTypes.func,
    onRecommendationAction: React.PropTypes.func,
    willToggleExpanded: React.PropTypes.func,
    recommendation: React.PropTypes.object.isRequired,
    shouldStartDetailed: React.PropTypes.bool,
    didToggleExpanded: React.PropTypes.func,
    onRemove: React.PropTypes.func,
  };

  state = {
    isRecExpanded: this.props.shouldStartDetailed || false,
    recHeight: 0,
  };

  componentWillUnmount() {
    this.props.onRemove && this.props.onRemove();
  }

  willToggleExpanded(isRecExpanded) {
    this.props.willToggleExpanded && this.props.willToggleExpanded(this.props.recommendation.id, isRecExpanded);
  }

  didToggleExpanded(isRecExpanded) {
    if (this.state.isRecExpanded !== isRecExpanded)
      this.setState({isRecExpanded});

    this.props.didToggleExpanded && this.props.didToggleExpanded(isRecExpanded);
  }

  onRecLayout(event) {
    this.setState({recHeight: event.nativeEvent.layout.height});
  }

  render() {
    let shouldFill = !this.state.isRecExpanded || this.state.recHeight < this.props.collapsedHeight;
    let height = {height: shouldFill ? this.props.collapsedHeight : null};

    return (
      <View style={height} onLayout={this.props.onLayout}>
        <Card style={styles.flexFull}>
          <Recommendation
            onLayout={this.onRecLayout.bind(this)}
            onRecommendationAction={this.props.onRecommendationAction}
            recommendation={this.props.recommendation}
            shouldStartDetailed={this.props.shouldStartDetailed}
            willToggleExpanded={this.willToggleExpanded.bind(this)}
            didToggleExpanded={this.didToggleExpanded.bind(this)}/>
        </Card>
      </View>
    );
  }
}

var styles = StyleSheet.create({

  zero: {
    flex: 0,
    height: 0,
  },

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
