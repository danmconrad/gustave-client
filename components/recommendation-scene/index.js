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
    goBack: React.PropTypes.func.isRequired,
    onToggleRecommendation: React.PropTypes.func.is,
  };

  state = {
    cleared: false,
    hasOverflow: false,
    toggleState: false,
  };

  attributes = {
    height: 0,
    childHeight: 0,
  };

  handleLayout(event) {
    this.attributes.height = event.nativeEvent.layout.height;
    InteractionManager.runAfterInteractions(this.checkOverflow.bind(this));
  }

  handleChildLayout(event) {
    this.attributes.childHeight = event.nativeEvent.layout.height;
    InteractionManager.runAfterInteractions(this.checkOverflow.bind(this));
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
    let shouldScroll = this.state.isChildDetailed && this.state.hasOverflow;
    if (!shouldScroll)
      this.refs.scroll.scrollTo({x: 0, y:0, animated: false});
  }

  didSwipeLeft() {
    this.props.goBack();
    this.setState({cleared: true});
  }

  render() {
    let recommendation = this.props.recommendation;

    let leftSwipeEdge = <Icon name="arrow-back" style={[styles.edgeLabel, this.context.theme.negativeAction]} />;

    let swipeableProps = {
      onSwipeLeft: this.didSwipeLeft.bind(this),
      leftSwipeEdge,
    };

    let shouldScroll = this.state.isChildDetailed && this.state.hasOverflow;

    return (
      <Swipeable 
          onLayout={this.handleLayout.bind(this)} 
          style={[styles.flexFull, this.props.style]}
          {...swipeableProps} >

        <ScrollView ref="scroll"
            scrollEnabled={this.state.hasOverflow} 
            contentContainerStyle={!shouldScroll && styles.flexFull}>

          {!this.state.cleared && 
          <Card style={!shouldScroll && styles.flexFull}>
            <Recommendation 
              onLayout={this.handleChildLayout.bind(this)} 
              recommendation={recommendation} />
          </Card>
          }

        </ScrollView>

      </Swipeable>
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

  edgeLabel: {
    fontSize: 96,
    fontWeight: '900',
    textAlign: 'center'
  },
});
