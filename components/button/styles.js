'use strict';

import React, {StyleSheet} from 'react-native';

export default StyleSheet.create({
  button: {
    backgroundColor: '#ccc',
    shadowColor: "#000",
    shadowOffset: {
      height: 2,
      width: 0
    },
    shadowOpacity: .4,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
});
