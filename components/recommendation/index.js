'use strict';

import React, {Component, View, Text, Image, Animated, Easing, TouchableOpacity, Dimensions} from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons'

import Details from './details';
import Teaser from './teaser';

const TO_HIDDEN = {
  toValue: 0,
  duration: 250,
  easing: Easing.elastic(1),
}

const TO_SHOWN = {
  toValue: 1,
  duration: 250,
  easing: Easing.elastic(1),
}

export default class Recommendation extends Component {

  static contextTypes = {
    user: React.PropTypes.object,
    database: React.PropTypes.object,
  };

  static propTypes = {
    recommendation: React.PropTypes.object.isRequired,
    onRecommendationAction: React.PropTypes.func,
    willToggle: React.PropTypes.func,
    onLayout: React.PropTypes.func,
    shouldStartDetailed: React.PropTypes.bool,
  };

  state = {
    isDetailed: false,
    recAnimation: new Animated.Value(1),
    imageAnimation: null,
    fontSizeAnimation: null,
    fontPaddingAnimation: null,

    detailAnimation: new Animated.Value(0),
  };

  componentDidMount() {
    // accounts for each ui element
    var {height} = Dimensions.get('window');

    let offset = 50 + 20 + 20 + 4 + 4;
    let cardHeight = (height - offset);

    this.setState({
      imageAnimation: this.state.recAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [cardHeight/5, cardHeight/2],
      }),
      fontSizeAnimation: this.state.recAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 32],
      }),
      fontPaddingAnimation: this.state.recAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 8],
      }),
    });

    /* 
      This should really be handled in initial state with a default...
      This is only here until recommendations are redone.
    */
    if (this.props.shouldStartDetailed) {
      this.toggleLayout();
    }
  }

  toggleSavedRecommendation() {
    let userId = this.context.user.id,
        recId = this.props.recommendation.id,
        db = this.context.database;

    let isUserSaved = db.isUserSavedRecommendation(userId, recId);

    if (isUserSaved)
      db.removeSavedUserRecommendation(userId, recId);
    else
      db.saveUserRecommendation(userId, recId);

    this.props.onRecommendationAction && this.props.onRecommendationAction();
  }

  toggleLayout() {
    // Needed to notify parent that the view is going to toggle, and what the new state will be
    if(this.props.willToggle)
      this.props.willToggle(!this.state.isDetailed);

    if(this.state.isDetailed){
      this.showRecommendation();
    } else {
      this.hideRecommendation();
    }
  }

  hideRecommendation() {
    this.composeAnimations(this.state.recAnimation, this.state.detailAnimation, true);
  }

  showRecommendation() {
    this.composeAnimations(this.state.detailAnimation, this.state.recAnimation, false);
  }

  composeAnimations(toHide, toShow, isDetailed) {

    return Animated.timing(toHide, TO_HIDDEN)
      .start(function(){
        this.setState({isDetailed: isDetailed});
        Animated.timing(toShow, TO_SHOWN).start();
      }.bind(this));
  }

  getImageStyles(){
    return { height: this.state.imageAnimation };
  }

  getTitleStyles(){
    return {
      fontSize: this.state.fontSizeAnimation,
      paddingHorizontal: this.state.fontPaddingAnimation,
      paddingTop: this.state.fontPaddingAnimation,
    }
  }

  getSubTitleStyles(){
    return {
      fontSize: this.state.fontSizeAnimation,
      paddingHorizontal: this.state.fontPaddingAnimation,
      paddingBottom: this.state.fontPaddingAnimation,
    }
  }

  getRecStyles(){
    return { opacity: this.state.recAnimation }
  }

  getDetailStyles(){
    return { opacity: this.state.detailAnimation }
  }

  createRecView(event, place){
    return (
      <Animated.View style={[styles.container, this.getRecStyles()]}>
        <Teaser event={event} place={place} />
      </Animated.View>
    );
  }

  createDetailView(event, place){
    return (
      <Animated.View style={[styles.container, this.getDetailStyles()]}>
        <Details event={event} place={place} />
      </Animated.View>
    );
  }

  render() {
    let rec = this.props.recommendation;
    let event = rec.event;
    let place = rec.place;
    let partial = (this.state.isDetailed)
      ? this.createDetailView(event, place)
      : this.createRecView(event, place);

    let isUserSaved = this.context.database
      .isUserSavedRecommendation(this.context.user.id, this.props.recommendation.id);

    return (
      <View
        style={[styles.container, !this.state.isDetailed ? styles.flexFull : styles.flexNone]}
        onLayout={this.props.onLayout}>

        <Animated.Image
          style={[this.getImageStyles(), styles.backgroundImage]}
          source={{uri: place.photo.uri}}>

          <View style={styles.overlay}>
            <TouchableOpacity onPress={this.toggleSavedRecommendation.bind(this)} style={styles.topButton}>
              <Icon name={isUserSaved ? 'favorite' : 'favorite-border'} size={30} style={styles.topButtonIcon}></Icon>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.toggleLayout.bind(this)} style={styles.topButton}>
              <Icon name="info-outline" size={30} style={styles.topButtonIcon}/>
            </TouchableOpacity>
          </View>

          <Animated.Text numberOfLines={1} style={[styles.title, this.getTitleStyles()]}>
            {event.name}
          </Animated.Text>
          <Animated.Text numberOfLines={1} style={[styles.title, styles.subtitle, this.getSubTitleStyles()]}>
            @ {place.name}
          </Animated.Text>

        </Animated.Image>

        {partial}

      </View>
    );
  }
}
