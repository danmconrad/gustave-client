'use strict';

import React, {StyleSheet} from 'react-native';

let OVERLAY_COLOR = 'rgba(98,12,59,.25)'

export default StyleSheet.create({

  container: {
    flex: 1,
    margin: 16,
    marginTop: 8,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
  },

  preview: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 16,
  },

  serviceIcon: {
    marginHorizontal: 5, 
    opacity: 0.75,
  },
});
