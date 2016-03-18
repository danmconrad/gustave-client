
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

import Icon from 'react-native-vector-icons/MaterialIcons';
import defaultImage from '../../assets/defaultMapView.jpg';

const DEFAULT_DELTA = 0.05;
const DELTA_COEF = 2.5;
const GEO_OPTIONS = {
  enableHighAccuracy: false,
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
    lat: React.PropTypes.number.isRequired,
    lng: React.PropTypes.number.isRequired,
    address: React.PropTypes.string.isRequired,
    location: React.PropTypes.string,
  };

  state = {
    position: null,
  };

  attributes = {
    isMounted: false,
    watchID: null,
  };

  componentWillUnmount() {
    this.attributes.isMounted = false;
    // navigator.geolocation.clearWatch(this.attributes.watchID);
  }

  componentDidMount() {
    this.attributes.isMounted = true;
    // InteractionManager.runAfterInteractions(() => this._setupGeolocation());
  }

  _setupGeolocation() {
    navigator.geolocation.getCurrentPosition(this._onPositionUpdate.bind(this), this._onGeoError.bind(this), GEO_OPTIONS);
    this.attributes.watchID = navigator.geolocation.getCurrentPosition(this._onPositionUpdate.bind(this), this._onGeoError.bind(this), GEO_OPTIONS);
  }

  _onGeoError () {
    if (!this.attributes.isMounted) return;
    this.setState({position: null});
  }
 
  _onPositionUpdate({coords: {latitude: lat, longitude: lng }}) {
    if (!this.attributes.isMounted) return;

    InteractionManager.runAfterInteractions(() => 
      this.setState({
        position: {lat, lng},
      })
    );

    /* TODO 
      For some reason this throws an error, looks to be bug with React Native
      
      let region = this._getMapRegion();    
      this.refs['map'].setNativeProps({region});
    */
  }

  _getDefaultMapRegion() {
    return {
      latitude: this.props.lat, longitude: this.props.lng, 
      latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA
    };
  }

  _getMapRegion(position) {
    if (!position) return this._getDefaultMapRegion();

    let placeLat = this.props.lat;
    let placeLng = this.props.lng;

    let latitude = (placeLat + position.lat) / 2;
    let longitude = (placeLng + position.lng) / 2;

    let latitudeDelta = Math.abs(placeLat - position.lat) * DELTA_COEF;
    let longitudeDelta = Math.abs(placeLng - position.lng) * DELTA_COEF;

    latitude = latitude + latitudeDelta * 0.1; // y-axis shift for pins

    return {latitude, longitude, latitudeDelta, longitudeDelta};
  }

  _getDirections () {
    let url = `http://maps.apple.com/?daddr=${this.props.address}`;
    Linking.openURL(url);
  }

  render() {
    // let realMap = 
    //   <MapView ref="map" style={[styles.map, this.props.style]}
    //     region={this._getMapRegion(this.state.position)}
    //     annotations={[{ latitude: this.props.lat, longitude: this.props.lng}]}
    //     {...MAP_CONFIG} />;

    let placeholder = 
      <Image style={[styles.map, this.props.style]} source={defaultImage}>
        <Icon name={'directions'} style={[styles.directionIcon]} size={30} />
      </Image> ;

    return(
      <TouchableOpacity onPress={this._getDirections.bind(this)} style={this.props.style}>
        {placeholder}
      </TouchableOpacity>
    );
  }
}

var styles = StyleSheet.create({

  map: {

  },

  directionIcon: {
    alignSelf: 'flex-end',
    margin: 8,
    color: 'rgba(44,7,44, 0.75)',
    backgroundColor: 'rgba(0,0,0,0)'
  },

});
