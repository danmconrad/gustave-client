'use strict';

import React, {
  Component,
  StyleSheet,
  ListView,
  ScrollView,
  View,
  Text,
  RefreshControl,
} from 'react-native';

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
      rowHasChanged: this.rowHasChanged.bind(this),
    }),
    viewportHeight: 0,
    isRefreshing: false,
  };

  attributes = {
    currentHeights: [],
    isExpanded: {},
    lastOffset: 0,
    currentTop: 0,
    currentBottom: 0,
    isDragging: false,
  };

  rowHasChanged(r1, r2) {
    return r1.id !== r2.id;
  }

  updateRowHeight(rowID, event) {
    this.attributes.currentHeights[Number(rowID)] = event.nativeEvent.layout.height;
    this.attributes.currentHeights.length = this.props.recommendations.length;
  }

  willToggleExpanded(recID, isExpanded) {
    this._scrollTo(this.attributes.currentTop);
    this.attributes.isExpanded[recID] = isExpanded;
  }

  didToggleExpanded() {
    this._scrollTo(this.attributes.currentTop, false);
  }

  onScroll(event) {
    if (this.attributes.isDragging || event.nativeEvent.contentOffset.y < 0) return;
    this.checkOverscroll();
  }

  checkShouldDoPaging(event) {
    if (this.state.isRefreshing) return;

    let contentOffset = event.nativeEvent.contentOffset,
        velocity = event.nativeEvent.velocity;

    if (this.attributes.isDragging)
      this.attributes.isDragging = false;

    let scrollOffset = contentOffset.y,
        scrollVelocity = velocity && velocity.y || 0,
        isScrollingDown = this.attributes.lastOffset < scrollOffset,
        heights = this.attributes.currentHeights,
        margin = this.state.viewportHeight * 0.25,
        adjustedMargin = Math.abs(scrollVelocity) > 1 ? 0 : margin;

    this.attributes.lastOffset = scrollOffset;

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

    let isSinglePage = heights[current] <= this.state.viewportHeight;

    let isScrollingWithin = isScrollingDown ?
      (scrollOffset < eBottom + adjustedMargin && scrollOffset > top) :
      (scrollOffset > top - adjustedMargin && scrollOffset < eBottom) ;

    if (!isSinglePage && isScrollingWithin)
      return this.checkOverscroll(isScrollingDown);

    let isFirst = current === 0;
    let isLast = !isFirst && current === heights.length - 1;

    if ((isScrollingDown && isLast) || (!isScrollingDown && isFirst))
      return;

    let edge = isScrollingDown ? top : eBottom;
    this._scrollTo(edge);

  }

  checkOverscroll(isScrollingDown) {
    if (this.attributes.isDragging || this.state.isRefreshing) return;

    let isScrollingExpanded = this.attributes.currentBottom - this.attributes.currentTop > this.state.viewportHeight;
    if (!isScrollingExpanded) return;

    let scrollOffset = this.refs['recList'].scrollProperties.offset,
        eBottom = this.attributes.currentBottom - this.state.viewportHeight;

    isScrollingDown = isScrollingDown !== null ? isScrollingDown : this.attributes.lastOffset < scrollOffset;

    if (isScrollingDown && scrollOffset > eBottom)
      this._scrollTo(eBottom);
    else if (!isScrollingDown && scrollOffset < this.attributes.currentTop)
      this._scrollTo(this.attributes.currentTop);
  }

  _scrollTo(y, animated) {
    this.attributes.lastOffset = y;
    this.refs['recList'].scrollTo({y, animated});
  }

  didSwipeLeft(recommendationID) {
    this._scrollTo(this.attributes.currentTop, false);
    this.context.database.dismissUserRecommendation(this.context.user.id, recommendationID);
    this.props.onRecommendationAction && this.props.onRecommendationAction();
  }

  didSwipeRight(recommendationID) {
    this.didSwipeLeft(recommendationID);
  }

  renderRow(recommendation, sectionID, rowID) {

    let swipeableProps = {
      rightSwipeEdge: <View/>,
      leftSwipeEdge: <View/>,
      onSwipeRight: this.didSwipeRight.bind(this, recommendation.id),
      onSwipeLeft: this.didSwipeLeft.bind(this, recommendation.id),
      // This next bit is faster than trigger a rerender
      onSwipeStart: () => this.refs['recList'].setNativeProps({canCancelContentTouches: false}),
      onSwipeEnd: () => this.refs['recList'].setNativeProps({canCancelContentTouches: true}),
    };

    let shouldStartDetailed = Boolean(this.attributes.isExpanded[recommendation.id]);

    return (
      <Swipeable key={recommendation.id} {...swipeableProps}>
        <ExpandableRecommendation key={recommendation.id}
          collapsedHeight={this.state.viewportHeight}
          onLayout={this.updateRowHeight.bind(this, rowID)}
          onRecommendationAction={this.props.onRecommendationAction}
          recommendation={recommendation}
          shouldStartDetailed={shouldStartDetailed}
          willToggleExpanded={this.willToggleExpanded.bind(this)}
          didToggleExpanded={this.didToggleExpanded.bind(this)}/>
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
        onLayout={(event) => this.setState({viewportHeight: event.nativeEvent.layout.height})}
        // Guard on datasource prevents render jank... we make sure we've measured the viewport before loading the recs
        dataSource={this.state.datasource.cloneWithRows(this.state.viewportHeight && this.props.recommendations)}
        renderRow={this.renderRow.bind(this)}
        canCancelContentTouches={true}
        directionalLockEnabled={true}
        initialListSize={1}
        onChangeVisibleRows={this.checkOverscroll.bind(this, null)}
        onScroll={this.onScroll.bind(this)}
        onScrollBeginDrag={() => this.attributes.isDragging = true}
        onScrollEndDrag={this.checkShouldDoPaging.bind(this)} // This shit ain't even documented, yo!
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
        scrollEventThrottle={100}
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
  };

  state = {
    isRecExpanded: this.props.shouldStartDetailed || false,
    recHeight: 0,
  };

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
