'use strict';

var _ = require('lodash');

import React, {
  Component,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

export default class NavigationBar extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
  };

  static propTypes = {
    navigator: React.PropTypes.object,
    heartNumber: React.PropTypes.number,
  };

  state = {
    clicked: null,
  };

  attributes = {
    savedScale: new Animated.Value(1)
  };

  componentWillMount() {
    this.didFocusListener = this.props.navigator.navigationContext.addListener('didfocus',
      () => this.setState({clicked: null})
    );
  }

  componentWillUnmount() {
    if (this.didFocusListener) this.didFocusListener.remove();
  }

  componentDidUpdate(prevProps) {
    let newHearted = this.props.heartNumber > prevProps.heartNumber;
    if (newHearted) {
      Animated.sequence([
        Animated.timing(this.attributes.savedScale, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(this.attributes.savedScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(this.attributes.savedScale, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(this.attributes.savedScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.quad)
        }),
      ]).start()
    }
  }

  onHomeClick() {
    this.resetToRoute('recommendations');
  }

  onHeartClick() {
    this.resetToRoute('saved');
  }

  resetToRoute(id) {
    this.setState({clicked: id});
    
    let homeRoute = null;
    if (id === 'recommendations') {
      homeRoute = _.find(this.props.navigator.getCurrentRoutes(), {id});
    }

    if (homeRoute) {
      this.props.navigator.popToRoute(homeRoute);
    } else {
      this.props.navigator.resetTo({id});
    }
  }

  render() {
    let currentRoutes = this.props.navigator.getCurrentRoutes();
    let currentRoute = _.last(currentRoutes);

    let isHomeRoute = (!this.state.clicked && currentRoute.id === 'recommendations') || this.state.clicked === 'recommendations';
    let isHeartRoute = (!this.state.clicked && currentRoute.id === 'saved') || this.state.clicked === 'saved';
    let isMenuRoute = (!this.state.clicked && currentRoute.id === 'settings') || this.state.clicked === 'settings';

    let homeStyles = isHomeRoute ? {opacity:1} : null;
    let heartsStyles = isHeartRoute ? {opacity:1} : {};
    let menuStyles = isMenuRoute ? {opacity:1} : null;

    heartsStyles.transform = [{scale: this.attributes.savedScale}];

    return (
      <View style={[styles.container, this.context.theme.darkBackground]}>
        <View style={[styles.buttonContainer, homeStyles]}>
          <TouchableOpacity
            onPress={this.onHomeClick.bind(this)}
            style={[styles.button, styles.backButton]}>
            <Icon name="home" style={[styles.icon, this.context.theme.navBarIcon]} />
          </TouchableOpacity>
        </View>

        <View style={[styles.buttonContainer, menuStyles]}>
          <TouchableOpacity
            style={[styles.button, styles.menuButton]}>
            <Icon name="search" style={[styles.icon, this.context.theme.navBarIcon]} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.buttonContainer, heartsStyles]}>
          <TouchableOpacity
            onPress={this.onHeartClick.bind(this)}
            style={[styles.button, styles.heartsButton]}>
            <Icon name="favorite" style={[styles.icon, this.context.theme.navBarIcon]} />
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.buttonContainer, menuStyles]}>
          <TouchableOpacity
            style={[styles.button, styles.menuButton]}>
            <Icon name="menu" style={[styles.icon, this.context.theme.navBarIcon]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}


var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: 50,
    right: 0, bottom: 0, left: 0,
    flexDirection: 'row',
  },

  buttonContainer: {
    flex: 1,
    opacity: 0.6,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },

  icon: {
    fontSize: 30,
  },

});
