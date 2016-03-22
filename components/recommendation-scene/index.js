'use strict';

import React, {
  Component, 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  InteractionManager
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Recommendation from '../recommendation';


export default class RecommendationScene extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
  };

  static propTypes = {
    recommendation: React.PropTypes.object.isRequired,
  };

  state = {
    showDetails: false,
  };

  toggleDetails() {
    if (this.state.showDetails)
      this.refs['scroll'].scrollTo({y:0, animated: true});

    // Wait until scroll animation has finished
    InteractionManager.runAfterInteractions(() => {
      this.setState({showDetails: !this.state.showDetails});
    });
  }

  /* React Component Lifecycle */
  render() {
    let shouldScroll = this.state.showDetails;
    let shouldFill = !this.state.showDetails;

    let emptyState = 
      <Text style={[styles.emptyText, this.context.theme.emptyText]}>Whoops! Looks like we lost something.</Text>;

    return (
      !this.props.recommendation ?
      /* Empty view */
      <View style={[styles.flexFull, styles.empty]}>{emptyState}</View> :

      /* Default view */
      <ScrollView ref="scroll"
          scrollEnabled={shouldScroll}
          contentContainerStyle={shouldFill && styles.flexFull}>
          <Recommendation 
            style={shouldFill && styles.flexFull}
            recommendation={this.props.recommendation}
            showDetails={this.state.showDetails}
            onToggleDetails={this.toggleDetails.bind(this)}/>
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
