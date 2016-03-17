'use strict';

import React, {
  Animated,
  Component,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import Map from './map';

export default class Recommendation extends Component {

  static contextTypes = {
    database: React.PropTypes.object,
    user: React.PropTypes.object,
  };

  static propTypes = {
    onLayout: React.PropTypes.func,
    onRecommendationAction: React.PropTypes.func,
    recommendation: React.PropTypes.object.isRequired,
    shouldStartDetailed: React.PropTypes.bool,
    style: View.propTypes.style,
    willToggleExpanded: React.PropTypes.func,
  };

  state = {
    isExpanded: true,
  };

  componentDidMount() {
  }

  toggleSavedRecommendation() {
  }

  toggleIsExpanded() {
    this.props.willToggleExpanded && this.props.willToggleExpanded(!this.state.isExpanded);
    this.setState({isExpanded: !this.state.isExpanded});
  }

  render() {
    let rec = this.props.recommendation;
    let event = rec.event;
    let place = rec.place;
    let imageSource = {uri: place.photo.uri};

    //TODO
    let isSaved = false;

    return (
      <View style={[styles.container, this.state.isExpanded ? styles.flexNone : styles.flexFull, this.props.style]} onLayout={this.props.onLayout}>
        <Image source={imageSource} style={[styles.topContainer, this.state.isExpanded && styles.flexNone]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Mortal Kombat</Text>
            <Text style={styles.subtitle}>Emporium</Text>
          </View>
        </Image>
        <View style={[styles.bottomContainer, this.state.isExpanded && styles.flexNone]}>
          {this.state.isExpanded ? <RecommendationContent rec={rec} /> : <RecommendationContentPreview rec={rec} />}
        </View>
        <View style={styles.actionContainer}>
          <View style={[styles.action, styles.toggleSavedAction]}>
            <Icon size={22} style={styles.actionIcon} name={isSaved ? 'favorite' : 'favorite-border'} />
          </View>
          <TouchableOpacity onPress={this.toggleIsExpanded.bind(this)} style={[styles.action, styles.viewMoreAction]}>
            <Text style={styles.viewMoreActionText}>{this.state.isExpanded ? 'VIEW LESS DETAILS' : 'VIEW MORE DETAILS'}</Text>
            <Icon size={32} style={styles.actionIcon} name={this.state.isExpanded ? 'expand-less' : 'expand-more'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class RecommendationContentPreview extends Component {
  render() {
    let labs = this.props.rec.event.labels;
    let labels = [].concat(labs, labs, labs, labs).join(',  ');

    return (
      <View style={styles.contentPreview}>
        <View style={styles.infoContainer}>
          <View style={styles.attributeContainer}>
            <Icon name="location-on" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>4.5 miles away</Text>
          </View>
          <View style={styles.serviceIconsContainer}>
            <Icon name="local-taxi" style={styles.serviceIcon} />
            <Icon name="local-offer" style={styles.serviceIcon} />
            <Icon name="local-dining" style={styles.serviceIcon} />
            <Icon name="local-movies" style={styles.serviceIcon} />
          </View>
        </View>
        <Text numberOfLines={6} style={styles.description}>Bacon ipsum dolor amet jerky tenderloin cow alcatra pork shoulder, t-bone chicken frankfurter. Jerky drumstick t-bone pastrami shoulder sirloin shankle. Porchetta pork belly sausage shank. Pork belly bresaola t-bone salami short ribs ham sirloin frankfurter flank shoulder sausage ground round leberkas turkey porchetta. </Text>
        <Text numberOfLines={1} style={styles.labelContainer}>{labels}</Text>
      </View>
    );
  }
}

class RecommendationContent extends Component {
  render() {

    let event = this.props.rec.event;
    let place = this.props.rec.place;
    let address = `${place.location.street}\n${place.location.city}, ${place.location.state} ${place.location.zipCode}`

    let eventLabels = event.labels.join(',  ');

    let imageSource = {uri: place.photo.uri};

    return (
      <View style={styles.content}>

        <Map
          style={styles.map}
          showUserPosition={true}
          address={address}
          lat={place.geo.lat}
          lng={place.geo.lng} />

        <View style={styles.attributesContainer}>
          <View style={styles.attributeContainer}>
            <Icon name="access-time" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>Today, 9pm - 10:30pm</Text>
          </View>
        </View>

        <Text style={styles.description}>Bacon ipsum dolor amet jerky tenderloin cow alcatra pork shoulder, t-bone chicken frankfurter. Jerky drumstick t-bone pastrami shoulder sirloin shankle. Porchetta pork belly sausage shank. </Text>
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

        <Text style={styles.placeTitle}>Emporium Logan Square</Text>

        <View style={styles.attributesContainer}>
          <View style={styles.attributeContainer}>
            <Icon name="date-range" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>Open 7am - 9pm</Text>
          </View>
          <View style={styles.attributeContainer}>
            <Icon name="location-on" style={styles.attributeIcon} />
            <Text style={styles.attributeText}>{'2313 N Milwaukee Ave \nChicago, IL 60647'}</Text>
          </View>
        </View>

        <View style={styles.placeImages}>
          <Image source={imageSource} style={styles.placeImage} resizeMode="cover" />
          <Image source={imageSource} style={styles.placeImage} resizeMode="cover" />
          <Image source={imageSource} style={styles.placeImage} resizeMode="cover" />
        </View>

        <Text style={styles.description}>Bacon ipsum dolor amet jerky tenderloin cow alcatra pork shoulder, t-bone chicken frankfurter. Jerky drumstick t-bone pastrami shoulder sirloin shankle. Porchetta pork belly sausage shank. </Text>
        <Text style={styles.labelContainer}>{eventLabels}</Text>

      </View>
    );
  }
}

var styles = StyleSheet.create({

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
    backgroundColor: 'rgba(44,7,44,0.75)',
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
