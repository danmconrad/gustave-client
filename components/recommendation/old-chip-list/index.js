'use strict';

import React, {Component, View} from 'react-native';
import styles from './styles';

import Chip from '../../chip';
import Stagger from '../../stagger';

export default class ChipList extends Component {
  render() {
    if (!this.props.labels.length) return;

    let chips = this.props.labels.map((tag) => {
      return (
        <Chip key={tag}
            chipStyle={this.props.chipStyle} 
            chipTextStyle={this.props.chipTextStyle}>
          {tag}
        </Chip>
      ); 
    });

    return (
      <View style={[styles.chipContainer, this.props.style]}>
        <Stagger components={chips} style={styles.staggerStyle} />
      </View>
    );
  }
}
