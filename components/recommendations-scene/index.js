'use strict';

import React, {
  Component, 
  StyleSheet,
  ListView, 
  ScrollView, 
  View, 
  Text,
  InteractionManager,
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
    scrollEnabled: true,
  };

  attributes = {
    currentHeights: [],
    isExpanded: {},
    lastOffset: 0,
    currentTop: 0,
  };
  
  rowHasChanged(r1, r2) {
    return r1.id !== r2.id;
  }

  updateRowHeight(rowID, event) {
    this.attributes.currentHeights[Number(rowID)] = event.nativeEvent.layout.height;
    this.attributes.currentHeights.length = this.props.recommendations.length;
  }

  onToggleRecommendation(recID, isExpanded) {
    this.attributes.isExpanded[recID] = isExpanded;
  }

  checkShouldDoPaging(event) {
    let scrollOffset = event.nativeEvent.contentOffset.y,
        velocity = event.nativeEvent.velocity.y,
        isScrollingDown = this.attributes.lastOffset < scrollOffset,
        heights = this.attributes.currentHeights,
        margin = this.state.viewportHeight * 0.10;

    this.attributes.lastOffset = scrollOffset;

    let current = 0, top = 0, bottom = 0, eBottom = 0;

    for (let i = 0, len = heights.length; i < len; i++) {
      let temp_top = bottom; // Top of this card is bottom of last card
      let temp_bottom = bottom + heights[i];
      let temp_eBottom = temp_bottom - this.state.viewportHeight;

      let adjustedMargin = Math.abs(velocity) > 1 ? 0 : margin;

      let threshold = isScrollingDown ? (temp_eBottom + adjustedMargin) : (temp_top - adjustedMargin);

      if (!isScrollingDown && scrollOffset < threshold)
        break;

      current = i;
      top = temp_top;
      bottom = temp_bottom;
      eBottom = temp_eBottom;

      if (isScrollingDown && scrollOffset < threshold)
        break;
    }

    this.attributes.currentTop = top;

    let isSinglePage = heights[current] <= this.state.viewportHeight;
    let edge = isScrollingDown ? top : eBottom;

    if (isSinglePage)
      return this._scrollTo(edge);

    let isScrollingWithin = scrollOffset > top - margin && scrollOffset < eBottom + margin;
    let isWithinRange = isScrollingDown ? (eBottom - margin < scrollOffset) : (scrollOffset < top + margin);
    edge = isScrollingDown ? eBottom : top;
    
    if (isScrollingWithin && isWithinRange)
      return this._scrollTo(edge);
    else if (isScrollingWithin)
      return;

    edge = isScrollingDown ? top : eBottom;
    this._scrollTo(edge);
    
  }

  _scrollTo(y, animated) {
    this.refs['recList'].scrollTo({y, animated});
    this.attributes.lastOffset = y;
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
        <ExpandableRecommendation 
          key={recommendation.id}
          onLayout={this.updateRowHeight.bind(this, rowID)}
          collapsedHeight={this.state.viewportHeight}
          recommendation={recommendation}
          onToggleRecommendation={this.onToggleRecommendation.bind(this)}
          onRecommendationAction={this.props.onRecommendationAction}
          shouldStartDetailed={shouldStartDetailed}/>
      </Swipeable>
    );

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
        dataSource={this.state.datasource.cloneWithRows(this.props.recommendations)} // The guard prevents shitty rendering
        renderRow={this.renderRow.bind(this)}
        canCancelContentTouches={true}
        directionalLockEnabled={true}
        showsVerticalScrollIndicator={false}
        initialListSize={1}
        pageSize={1}
        scrollRenderAheadDistance={this.state.viewportHeight}
        removeClippedSubviews={true}
        onScrollEndDrag={this.checkShouldDoPaging.bind(this)} // This shit ain't even documented, yo!
      />
    );
  }
}

class ExpandableRecommendation extends Component {

  static propTypes = {
    onLayout: React.PropTypes.func,
    recommendation: React.PropTypes.object,
    onRecommendationAction: React.PropTypes.func,
    collapsedHeight: React.PropTypes.number,
    onToggleRecommendation: React.PropTypes.func,
    shouldStartDetailed: React.PropTypes.bool,
  };

  state = {
    isRecDetailed: false,
    recHeight: 0,
  };

  onToggleRecommendation(isRecDetailed) {
    if (this.state.isRecDetailed !== isRecDetailed)
      this.setState({isRecDetailed});

    this.props.onToggleRecommendation && this.props.onToggleRecommendation(this.props.recommendation.id, this.state.isRecDetailed);
  }

  onRecLayout(event) {
    this.setState({recHeight: event.nativeEvent.layout.height});
  }

  checkOverflow(event) {
    if (!this.props.collapsedHeight) return;

    let contentHeight = this.attributes.contentHeight;
    let minHeight = this.props.minHeight;

    if (contentHeight > minHeight && this.state.cardHeight !== contentHeight)
      this.setState({cardHeight: contentHeight});
    else if (this.state.cardHeight !== minHeight)
      this.setState({cardHeight: minHeight}) 
  }

  render() {
    let shouldFill = !this.state.isRecDetailed || this.state.recHeight < this.props.collapsedHeight;

    return (
      <View style={shouldFill && {height: this.props.collapsedHeight}} onLayout={this.props.onLayout}>
        <Card style={shouldFill && styles.flexFull}>
          <Recommendation
            willToggle={this.onToggleRecommendation.bind(this)}
            onLayout={this.onRecLayout.bind(this)}
            recommendation={this.props.recommendation}
            onRecommendationAction={this.props.onRecommendationAction}
            shouldStartDetailed={this.props.shouldStartDetailed}/>
        </Card>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  flexFull: {
    flex: 1,
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
