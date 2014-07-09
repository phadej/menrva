/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

var signal = require("./signal.js");
/**
  ### Convinience methods

  #### signal.log

  > signal.log (@ : Signal a, args...) : Unsubscriber

  Essentially `signal.onValue(console.log.bind(console, args...))
*/
signal.Signal.prototype.log = function () {
  var args = Array.prototype.slice.call(arguments);
  return this.onValue(function (x) {
    var logArgs = args.concat([x]);
    console.log.apply(console, logArgs);
  });
};

/**
  #### signal.onSpread

  > signal.onSpread (@ : Signal [a, b...], callback : a -> b ... -> void) : Unsubscriber

  `onValue` with signal's tuple arguments spread.
*/
signal.Signal.prototype.onSpread = function (callback) {
  return this.onValue(function (t) {
    callback.apply(undefined, t);
  });
};

/**
  #### tuple

  > tuple (x : Signal a, y : Signal b...) : Signal [a, b...]

  Combine signals into tuple.
*/
function argsToArray() {
  return Array.prototype.slice.call(arguments);
}

function tuple() {
  var signals = Array.prototype.slice.call(arguments);
  var args = signals.concat([argsToArray]);
  return signal.combine.apply(signal, args);
}

module.exports = {
  tuple: tuple,
};
