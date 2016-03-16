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

    let routeStack = this.refs.navigator.getCurrentRoutes();
    let didRequestHomeRoute = id === homeRouteId;
    let homeRoute = _.find(routeStack, {id: homeRouteId});
    let homeRouteExists = Boolean(homeRoute);
    let currentIsHomeRoute = homeRouteExists && _.last(routeStack).id === homeRouteId;

    if (didRequestHomeRoute && currentIsHomeRoute)
      return;

    if (didRequestHomeRoute && homeRouteExists)
      return this.refs.navigator.popToRoute(homeRoute);

    if (didRequestHomeRoute && !homeRouteExists)
      return this.refs.navigator.resetTo({id});

    if (!didRequestHomeRoute && currentIsHomeRoute)
      return this.refs.navigator.push({id});

    // implied -- if (!didRequestHomeRoute && !currentIsHomeRoute) 
    this.refs.navigator.replace({id});
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
