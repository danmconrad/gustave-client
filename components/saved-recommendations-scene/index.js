import React, { 
  Component, 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ListView,
  TouchableOpacity, 
} from 'react-native';

import moment from 'moment';

import Swipeable from '../swipeable';
import Card from '../card';

import Icon from 'react-native-vector-icons/MaterialIcons';

const CARD_CLICK_ACTIVE_OPACITY = 0.7;
const RECENT_THRESHOLD_HOURS = 24;

export default class SavedRecommendationsScene extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
    navigation: React.PropTypes.object,
  };

  static propTypes = {
    recommendations: React.PropTypes.arrayOf(React.PropTypes.object),
  };

  static defaultProps = {
    recommendations: [],
  };

  state = {
    datasource: new ListView.DataSource({
      rowHasChanged: this.rowHasChanged.bind(this),
      sectionHeaderHasChanged: this.sectionHeaderHasChanged.bind(this),
    }),
  };


  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  sectionHeaderHasChanged(h1, h2) {
   return h1 !== h2; 
  }

  renderHeader() {
    return (
      <View style={this.context.theme.darkBackground}>
        <Text style={[styles.headingText, this.context.theme.headerText]}>Recent  <Icon name={'favorite'}/>  Activity</Text>
      </View>
    );
  }

  renderFooter() {
    return (
      <View style={this.context.theme.headerView}>
        <TouchableOpacity>
          <Text style={[styles.headingText, this.context.theme.headerText]}>View full history</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderSectionHeader(sectionData, sectionID) {
    let headerText = '';

    if (sectionID === 'recentlyAdded') 
      headerText = <Text style={[styles.headingText, this.context.theme.headerText]}>Recent <Icon name={'favorite-border'}/>s</Text>;
    else if (sectionID === 'happeningNow')
      headerText = <Text style={[styles.headingText, this.context.theme.headerText]}>Happening Now</Text>;
    else if (sectionID === 'upcoming')
      headerText = <Text style={[styles.headingText, this.context.theme.headerText]}>Upcoming</Text>;
    else if (sectionID === 'recentlyEnded')
      headerText = <Text style={[styles.headingText, this.context.theme.headerText]}>Recently Ended</Text>;  

    return (
      <View style={[this.context.theme.headerView]}>
        {headerText}
      </View>
    );
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
 
    let recommendation = rowData;

    let event = recommendation.event;
    let place = recommendation.place;
    let start = moment(event.time.start).format('ddd MM/DD @ h:mm A');
    let end  = moment(event.time.end).format('ddd MM/DD @ h:mm A');

    return (
      <Card>
        <TouchableOpacity 
          activeOpacity={CARD_CLICK_ACTIVE_OPACITY} 
          onPress={()=> this.context.navigation.goToRoute('recommendation', {recommendationID: recommendation.id})}>
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
        </TouchableOpacity>
      </Card>
    );
  }

  componentDidMount() {
    console.log(this.context);
  }

  render() {

    let fakeNow = moment('2016-02-17 21:00');

    // In the future, this should use only the recommendations saved this session
    // ... but we don't have sessions yet
    let recentlyAdded = this.props.recommendations
      .filter((rec) => {
        let isOver = moment(rec.event.time.end).isBefore(fakeNow);
        return !isOver;
      })
      .reverse();

    let happeningNow = this.props.recommendations
      .filter((rec) => {
        let isStarted = moment(rec.event.time.start).isSameOrBefore(fakeNow);
        let isOver = moment(rec.event.time.end).isBefore(fakeNow);
        return isStarted && !isOver;
      })
      .sort((a,b) => moment(b.event.time.start).isBefore(a.event.time.start));

    let upcoming = this.props.recommendations
      .filter((rec) => {
        let isStarted = moment(rec.event.time.start).isSameOrBefore(fakeNow);
        return !isStarted;
      })
      .sort((a,b) => moment(b.event.time.start).isBefore(a.event.time.start));

    let recentlyEnded = this.props.recommendations
      .filter((rec) => {
        let recEnd = moment(rec.event.time.end);
        let isOver = recEnd.isBefore(fakeNow);
        let recentThreshold = moment(recEnd).add(RECENT_THRESHOLD_HOURS, 'h');
        let isWithinRecentThreshold = fakeNow.isBefore(recentThreshold);
        return isOver && isWithinRecentThreshold;
      })
      .sort((a,b) => moment(a.event.time.start).isBefore(b.event.time.start));


    let data = {
      recentlyAdded,
      happeningNow,
      upcoming,
      recentlyEnded,
    };

    let hasSavedRecs = this.props.recommendations.length > 0;

    return (
      !hasSavedRecs ?
      /* Empty view */
      <View style={[styles.flexFull, styles.empty]}>
        <Text style={styles.emptyText}>
          No recent <Icon name={'favorite'}/> activity {'\n'}
          Try swiping right on a recommendation
        </Text> 
        <TouchableOpacity style={styles.menuLink}>
          <Text style={styles.emptyText}>View full history</Text>
        </TouchableOpacity>
      </View> :

      /* Default view */
      <ListView 
        dataSource={this.state.datasource.cloneWithRowsAndSections(data)}
        renderRow={this.renderRow.bind(this)}
        renderSectionHeader={this.renderSectionHeader.bind(this)}
        renderHeader={this.renderHeader.bind(this)}
        renderFooter={this.renderFooter.bind(this)}
      />
    );
  }
}

var styles = StyleSheet.create({
  flexFull: {
    flex: 1,
  },

  edgeContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },

  edgeLabel: {
    fontSize: 60,
    fontWeight: '900',
    padding: 10,
    textAlign: 'center',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    color: '#fff',
    textAlign: 'center',
  },

  recommendationContainer: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
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

  recommendationImage: {
    width: 100,
    height: 100,
  },

  headingText: {
    padding: 2.5,
    textAlign: 'center',
  },

  menuLink: {
    position: 'absolute',
    bottom: 50, left: 0, right: 0,
  }

});
