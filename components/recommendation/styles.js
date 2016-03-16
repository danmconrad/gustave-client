'use strict';

import React, {StyleSheet} from 'react-native';

let OVERLAY_COLOR = 'rgba(0, 0, 0, 0.75)';
let ICON_BACKGROUND = 'rgba(0, 0, 0, 0.45)';

export default StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  flexFull: {
    flex: 1,
  },

  flexNone: {
    flex: 0,
  },

  backgroundImage: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  title: {
    backgroundColor: OVERLAY_COLOR,
    fontSize: 10,
    color: '#ddd',
    fontWeight: '400',
    marginHorizontal: 8,
    alignSelf: 'flex-start',
  },

  subtitle: {
    marginBottom: 8,
  },

  overlay: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  topButtonIcon: {
    color: '#ccc',
    padding: 3,
  },

  topButton: {
    borderRadius: 10,
    backgroundColor: ICON_BACKGROUND,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
});
