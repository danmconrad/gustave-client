'use strict';

import React, {
  Component, 
  StyleSheet,
  ListView, 
  ScrollView, 
  View, 
  Text, 
  TouchableWithoutFeedback
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import Button from '../button';
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
    recommendations: React.PropTypes.arrayOf(React.PropTypes.object),
    onRecommendationAction: React.PropTypes.func,
    isLoadingMore: React.PropTypes.bool, // Will prob be replaced with call to this.props.relay.hasOptimisticUpdate
  };

  static defaultProps = {
    recommendations: [],
  };

  state = {
    hasOverflow: false,
    isChildDetailed: false,
    datasource: new ListView.DataSource({
      rowHasChanged: this.rowHasChanged.bind(this),
    }),
  };

  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  attributes = {
    height: 0,
    childHeight: 0,
  };

  handleLayout(event) {
    this.attributes.height = event.nativeEvent.layout.height;
    this.checkOverflow();
  }

  handleChildLayout(event) {
    this.attributes.childHeight = event.nativeEvent.layout.height;
    this.checkOverflow();
  }

  checkOverflow() {
    if (this.attributes.childHeight > this.attributes.height)
      !this.state.hasOverflow && this.setState({hasOverflow: true});
    else
      this.state.hasOverflow && this.setState({hasOverflow: false});

    this.checkScrollTop();
  }

  handleToggle(nextIsDetailed) {
    if (this.state.isChildDetailed !== nextIsDetailed) 
      this.setState({isChildDetailed: nextIsDetailed});

    this.checkScrollTop();
  }

  checkScrollTop() {
    if (!this.refs.scroll) return; 

    let shouldScroll = this.state.isChildDetailed && this.state.hasOverflow;
    if (!shouldScroll)
      this.scrollToTop(false);
  }

  scrollToTop(doAnimate) {
    if (!this.refs.scroll) return;
    this.refs.scroll.scrollTo({x: 0, y:0, animated: doAnimate || true});
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
      <Swipeable 
          // onLayout={this.handleLayout.bind(this)} 
          style={styles.flexFull}
          {...swipeableProps} >

          <Card>
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

    // let shouldScroll = this.state.isChildDetailed && this.state.hasOverflow;

    return (
      !this.props.recommendations.length ?
      /* Empty view */
      <View style={[styles.flexFull, styles.empty]}>{emptyState}</View> :

      /* Default view */
      <ListView 
          style={[styles.flexFull, this.props.style]}
          dataSource={this.state.datasource.cloneWithRows(this.props.recommendations)}
          renderRow={this.renderRow.bind(this)}
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

  headingText: {
    opacity: 0.85,
    textAlign: 'center',
    padding: 2.5,
  },

  edgeLabel: {
    fontSize: 96,
    fontWeight: '900',
    textAlign: 'center'
  },
});
