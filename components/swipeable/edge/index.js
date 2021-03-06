'use strict';

import React, {Component, StyleSheet, Animated, View} from 'react-native';
import _ from 'lodash';

export default class Edge extends Component {

  static propTypes = {
    containerHeight: React.PropTypes.number,
    position: React.PropTypes.oneOf(['left', 'right']).isRequired,
    width: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.instanceOf(Animated.Value)
      ]).isRequired,
  };

  render() {
    let size = {height: this.props.containerHeight, width: this.props.width};
    let position = this.props.position === 'right' ? {right: 0} : {left: -1}

    return (
      <Animated.View style={[styles.edge, position, size, this.props.style]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

var styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    alignItems:'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});