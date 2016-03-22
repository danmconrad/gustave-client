'use strict';

import React, {Component, StyleSheet, Navigator, StatusBar, View, Text} from 'react-native';

import _ from 'lodash';
import Immutable from 'immutable';

import theme, {statusBar} from '../../themes/default';
import * as database from '../../data';

import Navigation from '../navigation';


var User = Immutable.Record({userID: null, newRecommendations: [], savedRecommendations: []});

export default class Gustave extends Component {

  // This makes props available for child components without passing it all the way down the tree
  // See: https://facebook.github.io/react/docs/context.html
  static childContextTypes = {
    theme: React.PropTypes.object,
    app: React.PropTypes.object,
    user: React.PropTypes.object,
  };

  getChildContext() {
    return { 
      theme: this.state.theme,
      app: this,
      user: this.state.user, 
    };
  }

  state = {
    theme,
    user: new User(),
  };

  onUserLogin(userID) {
    let userData = {
      userID, 
      newRecommendations: database.getUserNewRecommendations(userID), 
      savedRecommendations: database.getUserSavedRecommendations(userID),
    };

    this.setState({user: new User(userData)});
  }

  onUserLogout() {
    this.setState({theme});
  }

  isUserSavedRecommendation(recommendationID) {
    return _.findIndex(this.state.user.get('savedRecommendations'), rec => rec.id === recommendationID) !== -1;
  }

  toggleSavedRecommendation(recommendationID) {
    if (this.isUserSavedRecommendation(recommendationID))
      this._removeSavedRecommendation(recommendationID);
    else
      this._addSavedRecommendation(recommendationID);
  }

  getUserRecommendation(recommendationID) {
    return database.getUserRecommendation(this.state.user.get('userID'), recommendationID)
  }

  refreshUserData() {
    let userID = this.state.user.get('userID');

    let userData = {
      userID, 
      newRecommendations: database.getUserNewRecommendations(userID), 
      savedRecommendations: database.getUserSavedRecommendations(userID),
    };

    this.setState({user: new User(userData)});
  }

  onServiceAction() {
    return 'noop';
  }


  /* Private methods */
  _addSavedRecommendation(recommendationID) {
    let userID = this.state.user.get('userID');
    database.addUserSavedRecommendation(userID, recommendationID);

    let userData = {
      userID, 
      newRecommendations: database.getUserNewRecommendations(userID), 
      savedRecommendations: database.getUserSavedRecommendations(userID),
    };

    this.setState({user: new User(userData)});
  }

  _removeSavedRecommendation(recommendationID) {
    let userID = this.state.user.get('userID');
    database.removeUserSavedRecommendation(userID, recommendationID);

    let userData = {
      userID, 
      newRecommendations: database.getUserNewRecommendations(userID), 
      savedRecommendations: database.getUserSavedRecommendations(userID),
    };

    this.setState({user: new User(userData)});
  }

  /* React component lifecycle */
  componentWillMount() {
    this.onUserLogin(1);
  }

  render() {
    return (
      <View style={[styles.app, this.state.theme.lightBackground]}>
        <View style={[styles.statusBarBackground, this.state.theme.darkBackground]} />
        <StatusBar barStyle={statusBar} />
        <Navigation />
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
