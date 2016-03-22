'use strict';

import React, {
  Animated,
  Component,
  Dimensions,
  Easing,
  Image,
  InteractionManager,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import Map from './map';
import Stagger from './stagger';

export default class Recommendation extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
    app: React.PropTypes.object,
    user: React.PropTypes.object,
  };

  static propTypes = {
    style: View.propTypes.style,
    onLayout: React.PropTypes.func,
    recommendation: React.PropTypes.object.isRequired,
    showDetails: React.PropTypes.bool.isRequired,
    onToggleDetails: React.PropTypes.func.isRequired,
  };

  toggleDetails() {
    this.props.onToggleDetails(this.props.recommendation.id);
  }

  /* React Component Lifecycle */
  componentDidMount() {
    this.refs['content'].refs['stagger'].skipAnimations();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.showDetails === this.props.showDetails)
      return;

    this.refs['content'].refs['stagger'].prepareForAnimations();

    let handle = InteractionManager.createInteractionHandle();
    LayoutAnimation.easeInEaseOut(() => {
      this.refs['content'].refs['stagger'].runAnimations();
      InteractionManager.clearInteractionHandle(handle);
    });
  }

  render() {
    let event = this.props.recommendation.event;
    let place = this.props.recommendation.place;
    let imageSource = {uri: place.photo.uri};

    return (
      <View 
        onLayout={this.props.onLayout}
        style={[styles.container, this.props.style]}>
        <Animated.Image 
          source={imageSource} 
          style={[styles.topContainer, 
            this.props.showDetails && styles.flexNone]}>
          <View style={[styles.titleContainer, this.context.theme.titleContainer]}>
            <Text style={styles.title}>{event.name}</Text>
            <Text style={styles.subtitle}>{place.name}</Text>
          </View>
        </Animated.Image>
        <View style={styles.bottomContainer}>
          {this.props.showDetails ? 
            <RecommendationContent 
              ref="content" 
              recommendation={this.props.recommendation} 
              onServiceAction={this.context.app.onServiceAction}/> : 
            <RecommendationContentPreview 
              ref="content" 
              recommendation={this.props.recommendation} 
              onServiceAction={this.context.app.onServiceAction}/>}
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            onPress={() => this.context.app.toggleSavedRecommendation(this.props.recommendation.id)} 
            style={[styles.action, 
              styles.toggleSavedAction]}>
            <Icon 
              size={22} 
              style={styles.actionIcon} 
              name={this.context.app.isUserSavedRecommendation(this.props.recommendation.id) ? 'favorite' : 'favorite-border'}/>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={this.toggleDetails.bind(this)} 
            style={[styles.action, styles.viewMoreAction]}>
            <Text style={styles.viewMoreActionText}>
              {this.props.showDetails ? 'VIEW LESS DETAILS' : 'VIEW MORE DETAILS'}
            </Text>
            <Icon 
              size={32} style={styles.actionIcon} 
              name={this.props.showDetails ? 'expand-less' : 'expand-more'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class RecommendationContentPreview extends Component {

  static propTypes = {
    onServiceAction: React.PropTypes.func.isRequired,
    recommendation: React.PropTypes.object.isRequired,
  };

  render() {
    let event = this.props.recommendation.event;
    let place = this.props.recommendation.place;
    let labels = event.labels.concat(place.labels).join(',  ');

    return (
      <Stagger ref="stagger" style={styles.contentPreview}>
        <View style={styles.infoContainer}>
          <View style={styles.attributeContainer}>
            <Icon name="location-on" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>0.25 mile away</Text>
          </View>
          <View style={styles.serviceIconsContainer}>
            <Icon name="local-taxi" style={styles.serviceIcon} />
            <Icon name="local-offer" style={styles.serviceIcon} />
            <Icon name="local-dining" style={styles.serviceIcon} />
            <Icon name="local-movies" style={styles.serviceIcon} />
          </View>
        </View>
        <Text numberOfLines={5} style={styles.description}>{event.description}</Text>
        <Text numberOfLines={1} style={styles.labelContainer}>{labels}</Text>
      </Stagger>
    );
  }
}

class RecommendationContent extends Component {

  static propTypes = {
    onServiceAction: React.PropTypes.func.isRequired,
    recommendation: React.PropTypes.object.isRequired,
  };

  render() {
    let event = this.props.recommendation.event;
    let place = this.props.recommendation.place;
    let address = `${place.location.street}\n${place.location.city}, ${place.location.state} ${place.location.zipCode}`
    let eventLabels = event.labels.join(',  ');
    let placeLabels = place.labels.join(',  ');
    let imageSource = {uri: place.photo.uri};
    let startTime = moment(event.time.start);
    let endTime = moment(event.time.end);
    let isHappeningToday = startTime.isSame('2016-02-17T18:00:00Z', 'day');
    let time = `${isHappeningToday ? 'Today, ' : startTime.format('ddd')} ${startTime.format('h:mma')} - ${endTime.format('h:mma')}`;

    return (
      <Stagger ref="stagger" style={styles.content}>

        <Map
          style={styles.map}
          showUserPosition={true}
          address={address}
          lat={place.geo.lat}
          lng={place.geo.lng} />

        <View style={styles.attributesContainer}>
          <View style={styles.attributeContainer}>
            <Icon name="access-time" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>{time}</Text>
          </View>
        </View>

        <Text style={styles.description}>{event.description}</Text>
        <Text style={styles.labelContainer}>{eventLabels}</Text>

        <View style={styles.servicesContainer}>
          <View style={styles.service}>
            <Icon name="local-taxi" style={styles.serviceIconLarge} />
            <Text style={styles.serviceTextLarge}>Uber</Text>
          </View>
          <View style={styles.service}>
            <Icon name="local-offer" style={styles.serviceIconLarge} />
            <Text style={styles.serviceTextLarge}>Groupon</Text>
          </View>
          <View style={styles.service}>
            <Icon name="local-dining" style={styles.serviceIconLarge} />
            <Text style={styles.serviceTextLarge}>OpenTable</Text>
          </View>
          <View style={styles.service}>
            <Icon name="local-movies" style={styles.serviceIconLarge} />
            <Text style={styles.serviceTextLarge}>StubHub</Text>
          </View>
        </View>

        <Text style={styles.placeTitle}>{place.name}</Text>

        <View style={styles.attributesContainer}>
          <View style={styles.attributeContainer}>
            <Icon name="date-range" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>Open {place.hours}</Text>
          </View>
          <View style={styles.attributeContainer}>
            <Icon name="location-on" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>{address}</Text>
          </View>
        </View>

        <View style={styles.placeImages}>
          <Image source={imageSource} style={styles.placeImage} resizeMode="cover" />
          <Image source={imageSource} style={styles.placeImage} resizeMode="cover" />
          <Image source={imageSource} style={styles.placeImage} resizeMode="cover" />
        </View>

        <Text style={styles.description}>{place.description}</Text>
        <Text style={styles.labelContainer}>{placeLabels}</Text>

      </Stagger>
    );
  }
}

var styles = StyleSheet.create({

  zero: {
    flex: 0,
    height: 0,
  },

  container: {
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  flexFull: {
    flex: 1,
  },
  flexNone: {
    flex: 0,
  },

  // Top
  topContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flex: 0.48,
  },

  titleContainer: {
    padding: 20,
    paddingTop: 36,
  },

  title: {
    color: '#fff',
    fontFamily: 'Roboto-Regular',
    fontSize: 23,
  },

  subtitle: {
    color: '#fff',
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },


  // Bottom
  bottomContainer: {
    flex: 0.52,
    padding: 20,
  },

  // Actions
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },

  toggleSavedAction: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },

  viewMoreAction: {
    flex: 1,
    paddingRight: 14,
    paddingLeft: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: '#e0e0e0',
  },

  viewMoreActionText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 15,
    letterSpacing: 0.6,
    color: '#4d4d4d',
  },

  actionIcon: {
    color: '#4d4d4d',
  },


  // Content
  contentPreview: {

  },

  content: {

  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },

  description: {
    color: '#444444',
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    marginBottom: 30,
  },

  labelContainer: {
    color: '#7f7f7f',
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    marginBottom: 20,
  },


  // Attributes
  attributesContainer: {
    marginBottom: 10,
  },

  attributeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  attributeIcon: {
    fontSize: 22,
    marginRight: 6,
    color: '#bfbfbf',
  },

  attributeText: {
    marginTop: 2,
    color: '#7f7f7f',
    fontFamily: 'Roboto-Regular',
  },


  // Services
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderColor: '#e0e0e0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 20,
  },

  service: {
    alignItems: 'center',
  },

  serviceTextLarge: {
    color: '#7f7f7f',
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
  },

  serviceIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },

  serviceIcon: {
    color: '#bfbfbf',
    fontSize: 22,
    marginLeft: 8,
  },

  serviceIconLarge: {
    fontSize: 32,
    color: '#bfbfbf',
    marginBottom: 4,
  },

  map: {
    margin: -10,
    marginBottom: 10,
    height: 100,
    width: null,
  },

  placeTitle: {
    marginBottom: 20,
    fontSize: 20,
    color: '#4d4d4d',
    fontFamily: 'Roboto-Regular',
  },

  placeImages: {
    flexDirection: 'row',
    marginHorizontal: -3,
    marginTop: 10,
    marginBottom: 20,
    height: 70,
  },

  placeImage: {
    flex: 1,
    margin: 3,
  },

});
