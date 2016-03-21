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

export default class Navigation extends Component {

  static contextTypes = {
    user: React.PropTypes.object,
    database: React.PropTypes.object,
  };

  static propTypes = {
    onRecommendationAction: React.PropTypes.func,
  };

  attributes = {
    initialRoute: {
      id: 'recommendations',
    }
  };

  goBack() {
    let routeStack = this.refs.navigator.getCurrentRoutes();
    if (routeStack.length > 1) {
      let index = routeStack.length - 2;
      let route = routeStack[index];

      if (route.id === 'recommendation')
        this.refs.navigator.popToRoute(route);
      else
        this.refs.navigator.resetTo({id: route.id});
    }
  }

  goToRoute(id, routeProps) {

    let homeRouteId = 'recommendations';
    let savedRouteId = 'saved';

    let routeStack = this.refs.navigator.getCurrentRoutes();

    // Home route is special... we should only reset it if routeProps are passed
    let didRequestHomeRoute = id === homeRouteId;
    let homeRoute = _.find(routeStack, {id: homeRouteId});
    let homeRouteExists = Boolean(homeRoute);
    let currentIsHomeRoute = homeRouteExists && _.last(routeStack).id === homeRouteId;

    if (didRequestHomeRoute && currentIsHomeRoute && !routeProps)
      return;

    if (didRequestHomeRoute && homeRouteExists && !routeProps)
      return this.refs.navigator.popToRoute(homeRoute);

    if (didRequestHomeRoute)
      return this.refs.navigator.resetTo({id, ...routeProps});

    if (currentIsHomeRoute)
      return this.refs.navigator.push({id, ...routeProps});

    // Saved route is also special... but shouldn't reset
    let didRequestSavedRoute = id === savedRouteId;
    let savedRoute = _.find(routeStack, {id: savedRouteId});
    let savedRouteExists = Boolean(savedRoute);
    let currentIsSavedRoute = savedRouteExists && _.last(routeStack).id === savedRouteId;

    if (didRequestSavedRoute && currentIsSavedRoute && !routeProps)
      return;

    if (didRequestSavedRoute && savedRouteExists && !routeProps)
      return this.refs.navigator.popToRoute(savedRoute);

    if (currentIsSavedRoute)
      return this.refs.navigator.push({id, ...routeProps});


    this.refs.navigator.replace({id, ...routeProps});
  }

  _configureScene(route, routeStack){
    return {
      ...Navigator.SceneConfigs.FloatFromBottomAndroid,
      // Overrides drag to dismiss gesture
      gestures: null,
    };
  }

  _renderScene(route, navigator) {
    switch(route.id) {
      case 'recommendations':
        return (
          <RecommendationsScene
            recommendations={this.context.database.getUserRecommendations(this.context.user.id)}
            onRecommendationAction={this.props.onRecommendationAction}/>
        );

      case 'recommendation':
        return (
          <RecommendationScene
            recommendation={this.context.database.getUserRecommendation(this.context.user.id, route.recommendationID)}
            onRecommendationAction={this.props.onRecommendationAction}/>
        );

      case 'saved':
        return (
          <SavedRecommendationsScene
            recommendations={this.context.database.getUserSavedRecommendations(this.context.user.id)}
            onRecommendationAction={this.props.onRecommendationAction}/>
        );
    }
  }

  render() {
    let heartNumber = this.context.database.getUserSavedRecommendations(this.context.user.id).length;
    let navBar = <NavigationBar navigation={this} heartNumber={heartNumber} />;

    return (
      <Navigator ref='navigator'
        sceneStyle={styles.scene}
        initialRoute={this.attributes.initialRoute}
        renderScene={this._renderScene.bind(this)}
        configureScene={this._configureScene.bind(this)}
        navigationBar={navBar} />
    );
  }
}

var styles = StyleSheet.create({
  scene: {
    marginBottom: 50,
  },
});

