
import React, { 
  Component, 
  Image, 
  ListView,
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import moment from 'moment';
import _ from 'lodash';

const FAKE_NOW = moment('2016-02-17 17:30');

const SortEnum = {
  UPCOMING: Symbol.for('upcoming'),
  NEARME: Symbol.for('nearby'),
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
  getFilteredAndSortedDataBlob() {
    switch(this.state.sort) {
      case SortEnum.UPCOMING:
        return this._getUpcomingDataBlob();
      case SortEnum.NEARME:
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
      'History': this.props.recommendations
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
    return (

      /* 
        START EDITING ROW CONTENT HERE

        NOTE: color of background and text is controlled by theme... just edit that for constency
     */

      <View style={[styles.sectionHeader, this.context.theme.headerView]}>
        <Text style={[styles.sectionHeaderText, this.context.theme.headerText]}>
          {sectionID}
        </Text>
      </View>

      /* 
        END EDITING 
      */

    );
  }

  renderRow(recommendation, sectionID, rowID) {

    let event = recommendation.event;
    let place = recommendation.place;
    let start = moment(event.time.start).format('ddd MM/DD @ h:mm A');
    let end  = moment(event.time.end).format('ddd MM/DD @ h:mm A');
    let distance = '1/4 mile away'; // Making this shit up right here

    return (
        <TouchableOpacity 
          onPress={()=> this.context.navigation.navToRoute('recommendation', {recommendationID: recommendation.id})}>
          
        {/* 
            START EDITING ROW CONTENT HERE

            We can use this.state.sort:enum to make minor variations
        */}

          <View style={styles.recommendationContainer}>
            <Image
              style={styles.recommendationImage}
              source={{uri: place.photo.uri}}/>
            <View style={styles.recommendationTextContainer}>
              <View style={styles.recommendationText}>
                <Text numberOfLines={1} style={styles.recommendationTitle}>
                  {event.name + ' @ ' + place.name}
                </Text>
                <Text numberOfLines={2} style={styles.recommendationDescription}>
                  {event.description}
                </Text>
                <Text style={styles.info}>{start}</Text>
              </View>
            </View>
          </View>

        {/* 
          END EDITING 
        */}

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
      <View style={styles.flexFull}>
        {/* 
            TODO: Top nav goes here
            Use: this.state.sort:enum to determine active 
            Use: this.setState({sort: SortEnum.*}) to set active on click
        */}
        <View>
          <TouchableOpacity onPress={() => this.setState({sort: SortEnum.UPCOMING})}>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({sort: SortEnum.NEARBY})}>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({sort: SortEnum.HISTORY})}>
          </TouchableOpacity>
        </View>
      {/*
          END TODO
      */}
        <ListView
          dataSource={this.state.datasource.cloneWithRowsAndSections(data)}
          renderRow={this.renderRow.bind(this)}
          renderSectionHeader={this.renderSectionHeader.bind(this)}/>
      </View>
    );
  }
}

var styles = StyleSheet.create({
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

  recommendationContainer: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  recommendationImage: {
    width: 100,
    height: 100,
  },

  recommendationTextContainer: {
    flex: 0.7,
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.25)',
  },

  recommendationText: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    margin: 8
  },

  recommendationTitle: {
    fontSize: 12,
    color: '#000',
    paddingBottom: 16, 
  },

  recommendationDescription: {
    fontSize: 10,
    color: '#111',
    paddingBottom: 8,
  },

  info: {
    fontSize: 10,
    color: '#ccc',
    paddingBottom: 4
  },

});
