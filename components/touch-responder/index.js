'use strict';

import React, {PanResponder} from 'react-native';
import _ from 'lodash';
import Dimensions from 'Dimensions';

// USE:
// Only supports single touch
//
// new TouchResponder({
//   onSwipeRelease: function(evt, gestureState, touchState){
//     if(touchState.direction === 'right'){
//       // Do something
//     } else if(touchState.direction === 'down'){
//       // Do something else
//     }
//   }
//
//   onDragRelease: (evt, gestureState, touchState) => doSomething(touchState)
//   onMove: (evt, gestureState, touchState) => doSomething(touchState)
// });


export default class TouchResponder {


  constructor(props){
    var passingFn = () => true;

    this.touchLifeCycle = {
      onSwipeRelease: props.onSwipeRelease || passingFn,
      onDragRelease: props.onDragRelease || passingFn,
      onMove: props.onMove || passingFn,
    };

    this.panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: passingFn,
      onStartShouldSetPanResponderCapture: passingFn,
      onMoveShouldSetPanResponder: passingFn,
      onMoveShouldSetPanResponderCapture: passingFn,
      onPanResponderTerminationRequest: passingFn,
      onShouldBlockNativeResponder: passingFn,
      onPanResponderGrant: (evt, gestureState) => {},
      onPanResponderTerminate: (evt, gestureState) => {},

      onPanResponderMove: (evt, gestureState) => this.onPanRespond(evt, gestureState, 'move'),
      onPanResponderRelease: (evt, gestureState) => this.onPanRespond(evt, gestureState, 'release'),
    });

    this.panHandlers = this.panResponder.panHandlers
  }

  railAxis = null;
  onPanRespond(evt, gestureState, evtType) {

    var cb = this.touchLifeCycle.onMove;
    var isSwiping = false;

    if (this.railAxis == null){
      var absXVelocity = Math.abs(gestureState.vx);
      var absYVelocity = Math.abs(gestureState.vy);

      if(absXVelocity > absYVelocity) {
        this.railAxis = 'x';
      } else {
        this.railAxis = 'y';
      }
    }

    if(this.railAxis === 'x') {
      var axis = 'x';
      var distance = gestureState.dx;
    } else {
      var axis = 'y';
      var distance = gestureState.dy;
    }

    if(absXVelocity > 1 || absYVelocity > 1) {
      isSwiping = true;
      if (evtType === 'release'){
        cb = this.touchLifeCycle.onSwipeRelease;
      }
    } else if (evtType === 'release'){
      cb = this.touchLifeCycle.onDragRelease;
    }

    var touchState = {
      axis: this.railAxis,
      distance: distance,
    };

    if (evtType === 'release'){
      this.railAxis = null;
    }

    cb(evt, gestureState, touchState);
  }
}
