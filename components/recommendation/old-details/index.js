'use strict';

import React, {Component, View, Text, Image} from 'react-native';
import styles from './styles';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons'

import Stagger from '../../stagger';
import RecMap from '../rec-map';
import ChipList from '../chip-list';

export default class Details extends Component {
  render() {
    let event = this.props.event;
    let place = this.props.place;
    let address = `${place.location.street}\n${place.location.city}, ${place.location.state} ${place.location.zipCode}`

    let start = moment(event.time.start).format('h:mm A');
    let end  = moment(event.time.end).format('h:mm A');

    let components = [
        <Text style={[styles.row, styles.description]}>{event.description}</Text>,

        <ChipList labels={event.labels} style={styles.row} chipTextStyle={{fontSize: 8}}/>,

        <View style={styles.row}>
          <Icon name={'access-time'} size={18} style={styles.descIcon} />
          <Text>Today, {start} - {end}</Text>
        </View>,

        <View style={styles.row}>
          <Icon name={'location-on'} size={18} style={styles.descIcon} />
          <Text>{address}</Text>
        </View>,

        <RecMap
          style={styles.row}
          showUserPosition={true}
          address={address}
          lat={place.geo.lat}
          lng={place.geo.lng} />,


        <Image
          style={[styles.row, {height: 100, marginBottom: 8}]}
          source={{uri: place.photo.uri}} />,

        <Text style={[styles.row, {fontWeight: 'bold'}]}>{place.name}</Text>,

        <Text style={[styles.row, styles.description]}>{place.description}</Text>,

        <View style={styles.row}>
          <Icon name={'date-range'} size={18} style={styles.descIcon} /><Text>Open {place.hours}</Text>
        </View>,

        <ChipList labels={place.labels} style={styles.row} chipTextStyle={{fontSize: 8}}/>,
    ];

    return (
      <View style={styles.container}>
        <Stagger components={components} />
      </View>
    )
  }
}
