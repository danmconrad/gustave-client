
import React, {
  Component,
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import moment from 'moment';
import _ from 'lodash';

const FAKE_NOW = moment('2016-02-17 17:30');

const SortEnum = {
  UPCOMING: Symbol.for('upcoming'),
  NEARBY: Symbol.for('nearby'),
  HISTORY: Symbol.for('history'),
};


/*
    NOTE:

    For easy editing, set default route to 'saved' and pass all recommendations to this scene
    Everything is already set up, just uncomment two lines of code in Navigation

*/


export default class SavedRecommendationsScene extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
    navigation: React.PropTypes.object,
  };

  static propTypes = {
    savedRecommendations: React.PropTypes.arrayOf(React.PropTypes.object),
  };

  static defaultProps = {
    savedRecommendations: [],
  };

  state = {
    datasource: new ListView.DataSource({
      rowHasChanged: this.rowHasChanged.bind(this),
      sectionHeaderHasChanged: this.sectionHeaderHasChanged.bind(this),
    }),
    sort: SortEnum.UPCOMING,
  };

  /*
    Sort Functions
  */

  changeSort(newSort) {
    LayoutAnimation.easeInEaseOut();
    this.setState({sort: newSort});
  }

  getFilteredAndSortedDataBlob() {
    switch(this.state.sort) {
      case SortEnum.UPCOMING:
        return this._getUpcomingDataBlob();
      case SortEnum.NEARBY:
        return this._getNearMeDataBlob();
      case SortEnum.HISTORY:
        return this._getHistoryDataBlob();
    }
  }

  _getUpcomingDataBlob() {
    let timeSort = (a,b) => moment(a.event.time.start).isSameOrBefore(b.event.time.start) ? -1 : 1;

    let isNotOver = this.props.savedRecommendations
      .filter(rec => FAKE_NOW.isBefore(rec.event.time.end));

    if (isNotOver.length < 1)
      return null;

    let happeningNow = isNotOver
      .filter(rec => FAKE_NOW.isSameOrAfter(rec.event.time.start))
      .sort(timeSort);

    let upcoming = _.difference(isNotOver, happeningNow).sort(timeSort);

    return {
      'Happening Now': happeningNow,
      'Upcoming': upcoming,
    };
  }

  _getNearMeDataBlob() {
    //TODO: actually add distance to each recommendation and sort accordingly
    let isNotOver = this.props.savedRecommendations
      .filter(rec => FAKE_NOW.isBefore(rec.event.time.end))
      .sort((a,b) => -1); // Here we'll do some shit with distance

    if (isNotOver.length < 1)
      return null;

    // We should probably group into distance baskets with headers, but for now...
    return {
      'Nearby': isNotOver
    };
  }

  _getHistoryDataBlob() {
    //TODO: actually add timestamps when added... but for now this does the same thing since we never mutate
    return {
      'History': this.props.savedRecommendations,
    };
  }

  /*
    ListView Render Functions
  */
  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  sectionHeaderHasChanged(h1, h2) {
   return h1 !== h2;
  }

  renderSectionHeader(sectionData, sectionID) {
    if (this.state.sort === SortEnum.HISTORY || this.state.sort === SortEnum.NEARBY)
      return null;

    return (
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionSeparatorText}>{sectionID}</Text>
      </View>
    );
  }

  renderSeparator(sectionID, rowID) {
    return (
      <View key={sectionID + rowID} style={styles.separator} />
    );
  }

  renderRow(recommendation, sectionID, rowID) {

    let event = recommendation.event;
    let place = recommendation.place;
    let start = moment(event.time.start).format('ddd MM/DD @ h:mm A');
    let end  = moment(event.time.end).format('ddd MM/DD @ h:mm A');
    let distance = '1/4 mile away'; // Making this shit up right here
    let imageSource = {uri: place.photo.uri};

    return (
        <TouchableOpacity
          style={styles.savedItem}
          onPress={()=> this.context.navigation.navToRoute('recommendation', {recommendationID: recommendation.id})}>
          <Image style={styles.image} source={imageSource} />
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>Mortal Kombat Showdown</Text>
            <Text style={styles.subTitle}>Emporium Logan Square</Text>
            <View style={styles.attributeContainer}>
              <Icon style={styles.attributeIcon} name="location-on" />
              <Text style={styles.attributeText}>4.5 miles</Text>
              <Icon style={styles.attributeIcon} name="access-time" />
              <Text style={styles.attributeText}>in 30 mins</Text>
            </View>
          </View>
        </TouchableOpacity>
    );
  }

  /*
    React component lifecyle
  */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (nextProps !== this.props || nextState !== this.state || nextContext !== this.context)
  }

  render() {
    let userHasNoSavedRecs = this.props.savedRecommendations.length < 1;

    if (userHasNoSavedRecs)
      return (
        <View style={[styles.flexFull, styles.empty]}>
          <Text style={[styles.emptyText, this.context.theme.emptyText]}>You have no saved <Icon size={16} name={'favorite'}/>s</Text>
        </View>
      );

    let data = this.getFilteredAndSortedDataBlob();

    if (!data)
      return (
        <View style={[styles.flexFull, styles.empty]}>
          <Text style={[styles.emptyText, this.context.theme.emptyText]}>You have no {Symbol.keyFor(this.state.sort)} <Icon size={16} name={'favorite'}/>s</Text>
        </View>
      );

    return (
      /* Default view */
      <View style={[styles.flexFull, styles.scene]}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={this.changeSort.bind(this, SortEnum.UPCOMING)} style={[styles.topHeaderItem, this.state.sort === SortEnum.UPCOMING && styles.topHeaderItemSelected]}>
            <Text style={[styles.topHeaderItemText, this.state.sort === SortEnum.UPCOMING && styles.topHeaderItemSelectedText]}>UPCOMING</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.changeSort.bind(this, SortEnum.NEARBY)} style={[styles.topHeaderItem, this.state.sort === SortEnum.NEARBY && styles.topHeaderItemSelected]}>
            <Text style={[styles.topHeaderItemText, this.state.sort === SortEnum.NEARBY && styles.topHeaderItemSelectedText]}>NEARBY</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.changeSort.bind(this, SortEnum.HISTORY)} style={[styles.topHeaderItem, this.state.sort === SortEnum.HISTORY && styles.topHeaderItemSelected]}>
            <Text style={[styles.topHeaderItemText, this.state.sort === SortEnum.HISTORY && styles.topHeaderItemSelectedText]}>HISTORY</Text>
          </TouchableOpacity>
        </View>
      {/*
          END TODO
      */}
        <ListView
          dataSource={this.state.datasource.cloneWithRowsAndSections(data)}
          renderRow={this.renderRow.bind(this)}
          renderSectionHeader={this.renderSectionHeader.bind(this)}
          renderSeparator={this.renderSeparator.bind(this)} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  scene: {
    backgroundColor: '#fff',
  },

  flexFull: {
    flex: 1,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    textAlign: 'center',
  },

  topHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
  },

  topHeaderItem: {
    borderBottomColor: '#d9d9d9',
    borderBottomWidth: 1,
    flex: 1,
    paddingVertical: 25,
  },

  topHeaderItemSelected: {
    borderBottomColor: '#4d4d4d',
  },

  topHeaderItemSelectedText: {
    color: '#4d4d4d',
  },

  topHeaderItemText: {
    textAlign: 'center',
    color: '#a9a9a9',
    fontFamily: 'Roboto-Bold',
  },

  separator: {
    borderBottomColor: '#d9d9d9',
    borderBottomWidth: 1,
  },

  sectionSeparator: {
    backgroundColor: '#f3f3f3',
    borderBottomColor: '#d9d9d9',
    borderBottomWidth: 1,
    padding: 3,
  },

  sectionSeparatorText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Roboto-Light',
    textAlign: 'center',
  },

  savedItem: {
    padding: 15,
    flexDirection: 'row',
  },

  detailsContainer: {
    paddingHorizontal: 20,
  },

  image: {
    height: 62,
    width: 105,
  },

  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    marginBottom: 2,
  },

  subTitle: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    marginBottom: 9,
  },

  attributeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  attributeIcon: {
    marginRight: 4,
    fontSize: 16,
    color: '#bfbfbf',
  },

  attributeText: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    marginRight: 15,
    color: '#999',
  },



});
