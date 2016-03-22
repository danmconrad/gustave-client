import React, {
  Component, 
  StyleSheet, 
  Navigator, 
  StatusBar, 
  View, 
  Text
} from 'react-native';

import _ from 'lodash';

import NavigationBar from './navigation-bar';
import RecommendationsScene from '../recommendations-scene';
import RecommendationScene from '../recommendation-scene';
import SavedRecommendationsScene from '../saved-recommendations-scene';


const INITIAL_ROUTE = {
  id: 'recommendations',
  // id: 'saved',
}

const HOME_ROUTE_ID = 'recommendations';
const SAVED_ROUTE_ID = 'saved';

export default class Navigation extends Component {

  static childContextTypes = {
    navigation: React.PropTypes.object,
  };

  getChildContext() {
    return { 
      navigation: this,
    };
  }

  static contextTypes = {
    app: React.PropTypes.object,
    user: React.PropTypes.object,
  };

  /* 
      Can be called by child components
  */
  navToRoute(id, routeProps) {

    let routeStack = this.refs.navigator.getCurrentRoutes();

    // Home route is special... we should only reset it if routeProps are passed
    let didRequestHomeRoute = id === HOME_ROUTE_ID;
    let homeRoute = _.find(routeStack, {id: HOME_ROUTE_ID});
    let homeRouteExists = Boolean(homeRoute);
    let currentIsHomeRoute = homeRouteExists && _.last(routeStack).id === HOME_ROUTE_ID;

    // Home route nav logic
    if (didRequestHomeRoute && currentIsHomeRoute && !routeProps)
      return;

    if (didRequestHomeRoute && homeRouteExists && !routeProps)
      return this.refs.navigator.popToRoute(homeRoute);

    if (didRequestHomeRoute)
      return this.refs.navigator.resetTo({id, ...routeProps});

    if (currentIsHomeRoute)
      return this.refs.navigator.push({id, ...routeProps});

    // Saved route is also special... but shouldn't reset
    let didRequestSavedRoute = id === SAVED_ROUTE_ID;
    let savedRoute = _.find(routeStack, {id: SAVED_ROUTE_ID});
    let savedRouteExists = Boolean(savedRoute);
    let currentIsSavedRoute = savedRouteExists && _.last(routeStack).id === SAVED_ROUTE_ID;

    // Saved route nav logic
    if (didRequestSavedRoute && currentIsSavedRoute && !routeProps)
      return;

    if (didRequestSavedRoute && savedRouteExists && !routeProps)
      return this.refs.navigator.popToRoute(savedRoute);

    if (currentIsSavedRoute)
      return this.refs.navigator.push({id, ...routeProps});

    // Default nav logic
    this.refs.navigator.replace({id, ...routeProps});
  }

  /* Navigator configuration */
  configureScene(route, routeStack){
    return {
      ...Navigator.SceneConfigs.FadeAndroid,
      // Overrides drag to dismiss gesture
      gestures: null,
    };
  }

  renderScene(route, navigator) {
    switch(route.id) {
      case 'recommendations':
        return (
          <RecommendationsScene
            recommendations={this.context.user.get('newRecommendations')}/>
        );

      case 'recommendation':
        return (
          <RecommendationScene
            recommendation={this.context.app.getUserRecommendation(route.recommendationID)}/>
        );

      case 'saved':
        return (
          <SavedRecommendationsScene
            savedRecommendations={this.context.user.get('savedRecommendations')}
            // savedRecommendations={this.context.user.get('newRecommendations')}
          />
        );
    }
  }


  /* React component lifecyle */
  render() {
    let navBar = 
      <NavigationBar 
        navigation={this} 
        heartNumber={this.context.user.get('savedRecommendations').length}/>;

    return (
      <Navigator ref='navigator'
        sceneStyle={styles.scene}
        initialRoute={INITIAL_ROUTE}
        renderScene={this.renderScene.bind(this)}
        configureScene={this.configureScene.bind(this)}
        navigationBar={navBar} />
    );
  }
}

var styles = StyleSheet.create({
  scene: {
    marginBottom: 50,
  },
});

