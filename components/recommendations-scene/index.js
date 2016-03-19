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

  willToggleExpanded(recID, isExpanded) {
    this._scrollTo(this.attributes.currentTop);
    this.attributes.isExpanded[recID] = isExpanded;
  }

  didToggleExpanded() {
    this._scrollTo(this.attributes.currentTop, false);
  }

  onScroll(event) {
    let scrollOffset = event.nativeEvent.contentOffset.y;
    if (scrollOffset < 0) return; // Handled by refresh control

    let isAutoScrolling = Number.isFinite(this.attributes.scroll.auto);
    let hasReachedAutoTarget = isAutoScrolling && scrollOffset === this.attributes.scroll.auto;

    if (isAutoScrolling && !hasReachedAutoTarget) return;

    if (hasReachedAutoTarget) {
      this.attributes.scroll.autoCallback && this.attributes.scroll.autoCallback();
      this.attributes.scroll.auto === null;
      this.attributes.scroll.autoCallback = null;
      this.checkCurrent();
    }

    if (this.attributes.scroll.autoHandle)
      this.attributes.scroll.autoHandle = null;

    if (this.attributes.scroll.isDragging)
      return (this.attributes.scroll.dy = scrollOffset - this.attributes.scroll.lastOffset);

    this.attributes.scroll.lastOffset = scrollOffset;
    this.checkOverscroll();
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

    if (!animated)
      this.checkCurrent();
  }

  checkCurrent() {
    let scrollOffset = this.refs['recList'].scrollProperties.offset;
    let heights = this.attributes.currentHeights;
    let current = 0, top = 0, bottom = 0, eBottom = 0, threshold = 0;

    for (let i = 0, len = heights.length; i < len; i++) {
      top = bottom; // Top of this card is bottom of last card
      bottom = bottom + heights[i];
      eBottom = bottom - this.state.viewportHeight;
      current = i;

      if (scrollOffset >= top && scrollOffset < bottom)
        break;
    }

    this.attributes.currentTop = top;
    this.attributes.currentBottom = bottom;
    this.attributes.current = current;
  }

  currentIsLastActiveRow() {
    let lastActiveRow = _.findLastIndex(this.props.recommendations, (rec) => !this.attributes.isRemoved[rec.id]);
    return this.attributes.current === lastActiveRow;
  }

  checkShouldDoPaging() {
    if (this.state.isRefreshing) return;

    let scrollOffset = this.attributes.scroll.dragOffset;
    let contentLength = this.refs['recList'].scrollProperties.contentLength;
    let lastEffectiveBottom = contentLength - this.state.viewportHeight;

    if (scrollOffset < 0 || scrollOffset > lastEffectiveBottom) return;

    let scrollVelocity = this.attributes.scroll.vy;
    let isScrollingDown = this.attributes.scroll.dy > 0;
    let margin = this.state.viewportHeight * 0.25;
    let adjustedMargin = Math.abs(scrollVelocity) > 1 ? 0 : margin;

    let heights = this.attributes.currentHeights;
    let current = 0, top = 0, bottom = 0, eBottom = 0, threshold = 0;

    for (let i = 0, len = heights.length; i < len; i++) {
      top = bottom; // Top of this card is bottom of last card
      bottom = bottom + heights[i];
      eBottom = bottom - this.state.viewportHeight;
      current = i;

      threshold = isScrollingDown ? (eBottom + adjustedMargin) : (bottom - adjustedMargin);

      if (scrollOffset < threshold)
        break;
    }

    this.attributes.currentTop = top;
    this.attributes.currentBottom = bottom;
    this.attributes.current = current;

    let isExpanded = heights[current] > this.state.viewportHeight;

    let isScrollingWithin = isExpanded && 
      (isScrollingDown ? (scrollOffset < eBottom + adjustedMargin && scrollOffset > top) :
        (scrollOffset > top - adjustedMargin && scrollOffset < eBottom));

    if (isScrollingWithin)
      return this.checkOverscroll();

    let edge = isScrollingDown ? top : eBottom;
    this._scrollTo(edge);
  }

  checkOverscroll() {
    if (this.state.isRefreshing) return;

    let scrollOffset = this.attributes.scroll.lastOffset;
    let contentLength = this.refs['recList'].scrollProperties.contentLength;
    let lastEffectiveBottom = contentLength - this.state.viewportHeight;

    if (scrollOffset < 0 || scrollOffset > lastEffectiveBottom) return;

    let isScrollingExpanded = this.attributes.currentBottom - this.attributes.currentTop > this.state.viewportHeight;

    if (!isScrollingExpanded) return;

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
    let scrollTo = this.attributes.currentBottom;
    let resetTo = this.attributes.currentBottom - this.state.viewportHeight;

    if (this.currentIsLastActiveRow()) {
      scrollTo = this.attributes.currentTop - this.state.viewportHeight;
      resetTo = scrollTo;
    }

    Animated.sequence([
      Animated.timing(this.attributes.removeAnimations[recommendationID], {
        toValue: 1.2,
        duration: 200,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(this.attributes.removeAnimations[recommendationID], {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(this.attributes.removeAnimations[recommendationID], {
        toValue: 1.2,
        duration: 200,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(this.attributes.removeAnimations[recommendationID], {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.quad)
      }),
    ]).start(() => {
      this.onRemoveRow(rowID, recommendationID);
      this.context.database.dismissUserRecommendation(this.context.user.id, recommendationID);
      this._scrollTo(scrollTo, true, () => {
        this.forceUpdate();
        if(Number.isFinite(resetTo))
          this._scrollTo(resetTo, false);
      });
    });
  }

  renderRow(recommendation, sectionID, rowID) {

    if (this.attributes.isRemoved[recommendation.id])
      return (null);

    this.attributes.removeAnimations[recommendation.id] = new Animated.Value(1);

    let scale = {transform: [{scale: this.attributes.removeAnimations[recommendation.id]}]};

    let swipeableProps = {
      /* 
        We infer user feedback rather than ask for it explictly, b/c behavioral studies have shown
        that asking a user to give explicit feedback results in users attempting to provide OBJECTIVE
        feedback rather than SUBJECTIVE enjoyment. 

        See e.g., Netflix
      */
      leftSwipeEdge: <Animated.View style={scale}><Icon name="close" size={60} style={{color: 'darkred'}}/></Animated.View>,
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
      !this.props.recommendations.length ?
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
    color: '#fff',
    textAlign: 'center',
  },
});
