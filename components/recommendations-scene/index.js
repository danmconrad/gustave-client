'use strict';

import React, {
  Component, 
  StyleSheet,
  ListView, 
  ScrollView, 
  View, 
  Text
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
    pagingEnabled: true,
    snapToInterval: 0,
  };

  attributes = {
    currentHeights: [],
  };

  rowHasChanged(r1, r2) {
    return r1.id !== r2.id;
  }

  updateRowHeight(rowID, event) {
    this.attributes.currentHeights[Number(rowID)] = event.nativeEvent.layout.height;
    this.checkShouldDoPaging();
  }

  checkShouldDoPaging() {
    let scrollOffset = this.refs['recList'].scrollProperties.offset;
    let heights = this.attributes.currentHeights;

    let current = 0, bottom = 0;
    for (let i = 0, len = heights.length; i < len; i++) {
      current = i;
      bottom = bottom + heights[i];

      if (bottom > scrollOffset)
        break;
    }

    let currentHeight = heights[current]; 

    if (currentHeight <= this.state.viewportHeight)
      return this._setPagingStateEfficiently(true);

    if (scrollOffset >= bottom - this.state.viewportHeight) {
      return this._setPagingStateEfficiently(true);
    }
      
    return this._setPagingStateEfficiently(false);
  }

  _setPagingStateEfficiently(pagingEnabled) {
    // if (this.state.pagingEnabled !== pagingEnabled)
      // this.setState({pagingEnabled, snapToInterval});
    this.refs['recList'].setNativeProps({pagingEnabled});
  }

  didSwipeLeft(recommendationID) {
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
    };

    return (
      <Swipeable {...swipeableProps}>
        <Card minHeight={this.state.viewportHeight} onLayout={this.updateRowHeight.bind(this, rowID)}>
          <Recommendation 
            recommendation={recommendation}
            onRecommendationAction={this.props.onRecommendationAction}/>
        </Card>
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
        dataSource={this.state.datasource.cloneWithRows(this.state.viewportHeight && this.props.recommendations)} // The guard prevents shitty rendering
        renderRow={this.renderRow.bind(this)}
        directionalLockEnabled={true}
        showsVerticalScrollIndicator={false}
        initialListSize={1}
        pageSize={1}
        scrollRenderAheadDistance={this.state.viewportHeight}
        removeClippedSubviews={true}
        pagingEnabled={true}
        onScroll={this.checkShouldDoPaging.bind(this)}
        // onContentSizeChange={this.checkShouldDoPaging.bind(this)}
        scrollEventThrottle={1}
      />
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
