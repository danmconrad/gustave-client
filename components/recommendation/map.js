'use strict';

import React, {
  Component,
  Image,
  InteractionManager,
  Linking,
  MapView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons'

const DEFAULT_DELTA = 0.01;
const DELTA_COEF = 2.5;
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000
};
const MAP_CONFIG = {
  showsUserLocation: true,
  followUserLocation: false,
  scrollEnabled: false,
  rotateEnabled: false,
  pitchEnabled: false,
};

export default class Map extends Component {

  static propTypes = {
    lat: React.PropTypes.number,
    lng: React.PropTypes.number,
  };

  static defaultProps = {
    lat: 0,
    lng: 0,
  };

  state = {
    position: null,
  };

  attributes = {
    watchID: null,
    mounted: false,
    cached: null,
  };

  // Lifecycle
  componentWillMount() {
    this.attributes.mounted = true;
    InteractionManager.runAfterInteractions(this.getInitialPosition.bind(this));
  }

  componentWillUnmount() {
    this.attributes.mounted = false;
    navigator.geolocation.clearWatch(this.attributes.watchID);
  }

  getInitialPosition() {
    if (!this.attributes.mounted) return;

    let onGetPosition = this.onGetPosition.bind(this);
    navigator.geolocation
      .getCurrentPosition(onGetPosition, this.onGeoError, GEO_OPTIONS);

    this.attributes.watchID = navigator.geolocation.watchPosition(onGetPosition);
  }

  onGeoError(){}

  onGetPosition(position) {
    if (!this.attributes.mounted) return;

    // Intentional rerender prevention, we'll forceUpdate() after interactions
    this.state.position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

    this.attributes.cached = this.renderMapView();

    // This prevents interference with scrolling the detail view
    InteractionManager.runAfterInteractions(() => {
      if (this.attributes.mounted)
       this.forceUpdate();
    });
  }

  // Rendering
  renderMapView() {
    let region = this.getMapRegion(this.state.position);
    let annotations = this.getMapAnnotations();

    return (
      <MapView
          style={styles.map}
          region={region}
          annotations={annotations}
          {...MAP_CONFIG} />
    );
  }

  getMapAnnotations(){
    return [{
      latitude: this.props.lat,
      longitude: this.props.lng,
    }];
  }

  getMapRegion(position){
    if (!position) return this.getDefaultRegion();

    let placeLat = this.props.lat;
    let placeLng = this.props.lng;

    let latitude = (placeLat + position.lat) / 2;
    let longitude = (placeLng + position.lng) / 2;

    let latitudeDelta = Math.abs(placeLat - position.lat) * DELTA_COEF;
    let longitudeDelta = Math.abs(placeLng - position.lng) * DELTA_COEF;

    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  }

  getDefaultRegion(){
    return {
      latitude: this.props.lat,
      longitude: this.props.lng,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    };
  }

  renderPlaceholder() {
    return (
      <View style={[styles.placeholderContainer, this.props.style]}>
        <Image
          style={styles.placeholderImage}
          source={require('../../assets/defaultMapView.jpg')} />
      </View>
    );
  }

  render() {
    let partial = this.attributes.cached || this.renderPlaceholder();

    return (
      <TouchableOpacity style={this.props.style}
          onPress={this.onGetDirections.bind(this)}
          activeOpacity={0.6}>

        <View>
          {partial}
          <Icon name={'directions'} style={[styles.directionIcon]} size={30} />
        </View>

      </TouchableOpacity>
    );
  }

  onGetDirections(){
    let url = `http://maps.apple.com/?daddr=${this.props.address}`;
    Linking.openURL(url);
  }
}

var styles = StyleSheet.create({
  map: {
    marginBottom: 16,
    height: 100,
    overflow: 'hidden',
  },

  placeholderContainer: {
    height: 100,
    marginBottom: 16,
    backgroundColor: '#eee',
  },

  placeholderImage: {
    height: 100,
    width: null,
  },

  directionIcon: {
    textAlign: 'right',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    margin: 8,
    color: 'rgba(44,7,44,0.75)',
    backgroundColor: 'rgba(0,0,0,0)'
  },

  altDirectionIcon: {
    color: '#fff',
  },
});
