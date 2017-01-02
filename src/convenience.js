/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

var signal = require("./signal.js");
var util = require("./util.js");

/**
  ### Convenience methods

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

function tuple() {
  var signals = Array.prototype.slice.call(arguments);
  var mapped = new (signal.CombinedSignal)(signals, util.identity);

  // connect to parent
  signals.forEach(function (parent) {
    parent.children.push(mapped);
  });

  return mapped;
}

/**
  #### sequence

  > sequence [Signal a, Signal b, ..] : Signal [a, b...]

  In promise libraries this might be called `all`.
*/
function sequence(signals) {
  var mapped = new (signal.CombinedSignal)(signals, util.identity);

  // connect to parent
  signals.forEach(function (parent) {
    parent.children.push(mapped);
  });

  return mapped;
}

/**
  #### record

  > record {k: Signal a, l: Signal b...} : Signal {k: a, l: b...}

  Like `sequence` but for records i.e. objects.
*/

function record(rec) {
  var keys = [];
  var signals = [];

  for (var k in rec) {
    // if (Object.prototype.hasOwnProperty.call(rec, k)) {
    keys.push(k);
    signals.push(rec[k]);
    // }
  }

  function toObject(values) {
    var res = {};

    for (var i = 0; i < keys.length; i++) {
      res[keys[i]] = values[i];
    }

    return res;
  }

  var mapped = new (signal.CombinedSignal)(signals, toObject);

  // connect to parent
  signals.forEach(function (parent) {
    parent.children.push(mapped);
  });

  return mapped;
}

module.exports = {
  tuple: tuple,
  sequence: sequence,
  record: record,
};
