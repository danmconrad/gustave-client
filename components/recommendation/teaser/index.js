'use strict';

import React, {Component, View, Text} from 'react-native';
import styles from './styles';
import _ from 'lodash';

import ChipList from '../chip-list';

export default class Teaser extends Component {

  render() {
    let event = this.props.event;
    let place = this.props.place;

    let labels = _.union(event.labels, place.labels);

    return (
      <View style={styles.container}>
        <ChipList labels={labels} />
      </View>
    )
  }
}
