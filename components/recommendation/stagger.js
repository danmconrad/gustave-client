'use strict';

import React, { 
  Component, 
  View, 
  Text, 
  Animated,
  InteractionManager,
} from 'react-native';


export default class Stagger extends Component {

  static propTypes = {
    style: View.propTypes.style,
  };

  attributes = {
    animations: [],
    components: [],
  };

  componentWillMount() {
    this.attributes.components = React.Children.map(this.props.children, (component, i) => {
      this.attributes.animations[i] = new Animated.Value(0);
      return (
        <Animated.View style={{opacity: this.attributes.animations[i]}}>
          {component}
        </Animated.View>
      );
    });
  }

  skipAnimations() {
    this.attributes.animations.forEach((animation) => animation.setValue(1));
  }

  prepareForAnimations() {
    this.attributes.animations.forEach((animation) => animation.setValue(0));
    return this;
  }

  runAnimations() {
    var handle = InteractionManager.createInteractionHandle();
    let animations = this.attributes.animations.map((animation) => 
      Animated.timing(animation, {toValue: 1})
    );
    Animated.stagger(50, animations).start(() => InteractionManager.clearInteractionHandle(handle));
  }

  render() {
    return(
      <View style={this.props.style}>
        {this.attributes.components}
      </View>
    );
  }
}
