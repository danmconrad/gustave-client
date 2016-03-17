'use strict';

import React, {Component, View, Text} from 'react-native';
import styles from './styles';
import _ from 'lodash';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons'

import Stagger from '../../stagger';
import ChipList from '../chip-list';

export default class Teaser extends Component {

  render() {
    let event = this.props.event;
    let place = this.props.place;

    let start = moment(event.time.start).format('h:mm A');

    let labels = _.union(event.labels, place.labels);

    let innerComponents = [
      <Text componentStyle={{flex: 1}} style={{flex: 1, opacity: 0.65, marginHorizontal: 5, textAlign: 'left'}}>Happening 0.25 miles away</Text>,
      <Icon name="local-taxi" size={20} style={styles.serviceIcon} />,
      <Icon name="local-offer" size={20} style={styles.serviceIcon} />,
      <Icon name="local-movies" size={20} style={styles.serviceIcon} />,
      <Icon name="local-dining" size={20} style={styles.serviceIcon} />,
    ];


    let components = [
      <ChipList labels={labels} />,
    ];

    return (
      <View style={styles.container}>
        <Stagger style={{marginTop: 16}} components={components} />
        <Stagger
            style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end', bottom: 0}}
            components={innerComponents} />
      </View>
    )
  }
}
