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
}

export default class Navigation extends Component {

  static contextTypes = {
    user: React.PropTypes.object,
    database: React.PropTypes.object,
  };

  static propTypes = {
    onServiceAction: React.PropTypes.func.isRequired,
  };

  state = {
    heartNumber: this.context.database.getUserSavedRecommendations(this.context.user.id).length,
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

  onToggleSaved() {
    this.setState({heartNumber: this.context.database.getUserSavedRecommendations(this.context.user.id).length});
  }

  configureScene(route, routeStack){
    return {
      ...Navigator.SceneConfigs.FloatFromBottomAndroid,
      // Overrides drag to dismiss gesture
      gestures: null,
    };
  }

  renderScene(route, navigator) {
    switch(route.id) {
      case 'recommendations':
        return (
          <RecommendationsScene
            recommendations={this.context.database.getUserRecommendations(this.context.user.id)}
            onToggleSaved={this.onToggleSaved.bind(this)}
            onServiceAction={this.props.onServiceAction}/>
        );

      case 'recommendation':
        return (
          <RecommendationScene
            recommendation={this.context.database.getUserRecommendation(this.context.user.id, route.recommendationID)}
            onToggleSaved={this.onToggleSaved.bind(this)}
            onServiceAction={this.props.onServiceAction}/>
        );

      case 'saved':
        return (
          <SavedRecommendationsScene
            recommendations={this.context.database.getUserSavedRecommendations(this.context.user.id)}
            onServiceAction={this.props.onServiceAction}/>
        );
    }
  }


  /* React component lifecyle */

  render() {
    let navBar = <NavigationBar navigation={this} heartNumber={this.state.heartNumber} />;

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

