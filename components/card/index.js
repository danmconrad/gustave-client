'use strict';

import React, {Component, StyleSheet, View} from 'react-native';

export default class Card extends Component {

  static propTypes = {
    style: View.propTypes.style,
  };
  render() {
    return (
      <View style={[styles.cardOne, this.props.style]}>
        <View style={[styles.cardTwo]}>
          <View style={[styles.cardThree]}>
            {this.props.children}
          </View>
        </View>
      </View>
    );
  }
}


var styles = StyleSheet.create({

  cardOne: {
    margin: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c9c9c999',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  cardTwo: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#c9c9c9cc',
    flex: 1,
    overflow: 'hidden',
  },

  cardThree: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#c9c9c9',
    flex: 1,
    overflow: 'hidden',
  },

});
