'use strict';

import React, {Component, StyleSheet, ScrollView, View, Text, InteractionManager} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Button from '../button';
import Recommendation from '../recommendation';
import Swipeable from '../swipeable';
import Card from '../card';


export default class RecommendationScene extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
  };

  static propTypes = {
    recommendation: React.PropTypes.object.isRequired,
    onRecommendationAction: React.PropTypes.func,
  };

  state = {
    isChildDetailed: false,
  };

  handleChildToggle(nextIsDetailed) {
    if (this.state.isChildDetailed !== nextIsDetailed) 
      this.setState({isChildDetailed: nextIsDetailed});

    this.checkScrollTop();
  }

  checkScrollTop() {
    if (!this.state.isChildDetailed)
      this.refs.scroll.scrollTo({x: 0, y:0, animated: true});
  }

  render() {
    let shouldScroll = this.state.isChildDetailed;

    let emptyState = 
      <Text style={styles.emptyText}>Whoops! Looks like we lost something.</Text>;

    return (
      !this.props.recommendation ?
      /* Empty view */
      <View style={[styles.flexFull, styles.empty]}>{emptyState}</View> :

      /* Default view */
      <ScrollView ref="scroll"
          scrollEnabled={shouldScroll} 
          contentContainerStyle={!shouldScroll && styles.flexFull}>

          <Recommendation 
            willToggle={this.handleChildToggle.bind(this)}
            onRecommendationAction={this.props.onRecommendationAction}
            recommendation={this.props.recommendation} />

      </ScrollView>
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
