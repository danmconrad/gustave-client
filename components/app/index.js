'use strict';

import React, {Component, StyleSheet, Navigator, StatusBar, View, Text} from 'react-native';
import _ from 'lodash';

import theme, {statusBar} from '../../themes/default';
import * as database from '../../data';

import Navigation from '../navigation';

export default class Gustave extends Component {

  // This makes props available for child components without passing it all the way down the tree
  // See: https://facebook.github.io/react/docs/context.html
  static childContextTypes = {
    theme: React.PropTypes.object,
    user: React.PropTypes.object,
    database: React.PropTypes.object,
    navigation: React.PropTypes.object,
  };

  getChildContext() {
    return { 
      theme: this.state.theme, 
      user: this.state.user, 
      database: this.state.database,
      navigation: this.state.navigation,
    };
  }

  state = {
    user: database.getUser(1),
    database,
    theme,
  };

  onServiceAction() {
    return 'noop';
  }

  componentDidMount() {
    this.setState({navigation: this.refs['navigation']}); 
  }

  render() {
    return (
      <View style={[styles.app, this.state.theme.lightBackground]}>
        <View style={[styles.statusBarBackground, this.state.theme.darkBackground]} />
        <StatusBar barStyle={statusBar} />
        <Navigation 
          ref="navigation"
          onServiceAction={this.onServiceAction.bind(this)}
        />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  statusBarBackground: {
    height: 20,
  }
});
