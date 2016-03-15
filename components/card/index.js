'use strict';

import React, {Component, View, Animated, Easing} from 'react-native';

import styles from './styles';

export default class Card extends Component {

  static propTypes = {
    style: View.propTypes.style,
  };

  state = {
    // enterAnimation: new Animated.Value(0),
  };

  componentDidMount() {
    // Animated.timing(this.state.enterAnimation, {
    //   toValue: 1,
    //   duration: 250,
    //   easing: Easing.elastic(1),
    // }).start();
  }

  render() {

    let transforms = [{scale: this.state.enterAnimation}, ];

    // return (
    //   <Animated.View style={[styles.card, this.props.style, {transform: transforms, opacity: this.state.enterAnimation}]}>
    //     {this.props.children}
    //   </Animated.View>
    // );
    return (
      <Animated.View style={[styles.card, this.props.style]}>
        {this.props.children}
      </Animated.View>
    );
  }
}
