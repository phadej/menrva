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
