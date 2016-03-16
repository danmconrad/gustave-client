'use strict';

import React, {Component, StyleSheet, View, Animated, Easing} from 'react-native';

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
    // }).start(() => {
    //   this.attributes.animationFinished = true;
    //   this.checkOverflow();
    // });
  }

  render() {
    return (
      <View {...this.props}
        style={[styles.card, this.props.style, 
          // {transform: [{scale: this.state.enterAnimation}], opacity: this.state.enterAnimation},
        ]}>
          {this.props.children}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  flexFull : {
    flex: 1,
  },

  card: {
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    backgroundColor: '#fff',
    // Shadow won't work with overflow hidden, which is required for jumbotron image corners to match card corner
    overflow: 'hidden'
  },

});
