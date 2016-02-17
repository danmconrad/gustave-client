'use strict';

import React, {StyleSheet} from 'react-native';

export default StyleSheet.create({

  backgroundImage: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
    marginRight: 16,
    marginLeft: 16,
  },

  titleContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    alignSelf: 'center',
  },

  title: {
    fontSize: 16,
    color: '#fff',
    padding: 16,
    textAlign: 'center',
  },

  event: {
    flex: 0.35,
    padding: 16,
  },

  place: {
    flex: 0.55,
    padding: 16,
  },

  subtitle: {
    fontSize: 16,
    color: '#111',
    paddingBottom: 8,
  },

  address: {
    fontSize: 12,
    color: '#ccc',
    paddingBottom: 4
  },

  chipContainer: {
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },

  chip: {
    backgroundColor: '#620c3b',
  },

  chipText: {
    color: '#e3e4d9',
    fontSize: 10,
  },

  chipIconText: {
    color: '#fff0b3',
    fontSize: 16,
  },
});
