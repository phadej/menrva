/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

var egal = require("./egal.js");
var util = require("./util.js");

/**
  ### Signal

  The core type of menrva. `Signal` is abstract class, and cannot be created explicitly.

  Similar concepts are: *Behaviours* in FRP, *Properties* in bacon.js.

  You can add methods to `Signal`'s prototype. They will be available on all signals.
*/
function Signal() {}

// Each signal has an unique index.
var index = 0;

function initSignal(signal, value, eq) {
  signal.children = [];
  signal.callbacks = [];
  signal.value = value;

  // `index` is used to implement faster sets of signals
  signal.index = index++;

  // `rank` is used to sort signals topologically
  signal.rank = signal.calculateRank();

  // `eq` is an equality decision function on the signal values
  signal.eq = eq || egal;
}

function CombinedSignal(parents, f, eq) {
  this.parents = parents;
  this.f = f;
  var value = this.calculate();
  initSignal(this, value, eq);
}

CombinedSignal.prototype = new Signal();

// rank of combined signal is 1 + maximum rank of parents
CombinedSignal.prototype.calculateRank = function () {
  return Math.max.apply(Math, util.pluck(this.parents, "rank")) + 1;
};

CombinedSignal.prototype.calculate = function () {
  return this.f.apply(undefined, util.pluck(this.parents, "value"));
};

/**
  #### signal.map

  > map (@ : Signal a, f : a -> b, eq = egal : b -> b -> boolean) : Signal b
*/ 
Signal.prototype.map = function(f, eq) {
  var mapped = new CombinedSignal([this], f, eq);
  this.children.push(mapped);
  return mapped;
};

/**
  #### signal.onValue

  > onValue (@ : Singal a, callback : a -> void) -> Unsubscriber

  Add value callback. `callback` is immediately executed with the current value of signal.
  After than `callback` will be called, each time signal's value changes.

  The return value is a function, which will remove the callback if executed.
*/
Signal.prototype.onValue = function (callback) {
  // we wrap callback in function, to make it unique
  var wrapped = function (x) { callback(x); };

  // add to callbacks list
  this.callbacks.push(wrapped);

  // execute the callback *synchronously*
  callback(this.value);

  // return unsubscriber
  var that = this;
  return function () {
    var index = that.callbacks.indexOf(wrapped);
    if (index !== -1) {
      that.callbacks.splice(index, 1);
    }
  };
};

/**
  ### Source

  A signal which value you can set.

  Similar concepts are: *Bacon.Model* in bacon.js, *BehaviourSubject* in Rx.


  #### source

  > source (initialValue : a, eq = egal : a -> a -> boolean) : Source a
*/
function Source(initialValue, eq) {
  initSignal(this, initialValue, eq);
}

function source(initialValue, eq) {
  return new Source(initialValue, eq);
}

Source.prototype = new Signal();

Source.prototype.calculateRank = function () {
  return 0;
};

/**
  #### source.set

  > set (@ : Source a, tx : Transaction, value : a) : void
*/
Source.prototype.set = function (transaction, value) {
  transaction.addAction({
    type: "set",
    signal: this,
    value: value,
  });
};

/**
  #### source.modify

  > modify (@ : Source a, tx : Transaction, f : a -> a) : void

  Mofify source value. `f` will be called with current value of signal inside the transaction.
*/
Source.prototype.modify = function (transaction, f) {
  transaction.addAction({
    type: "modify",
    signal: this,
    f: f,
  });
};


/**
  ### Signal combinators
*/

/**
  #### combine

  > combine (Signal a..., f : a... -> b) : Signal b

  Applicative n-ary lift. Lift pure function to operate on signals:
  ```js
  var $sum = menrva.combine($a, $b, function (a, b) {
    return a + b;
  });
  ```
*/
function combine() {
  var signals = Array.prototype.slice.call(arguments, 0, -1);
  var f = arguments[arguments.length - 1];

  var mapped = new CombinedSignal(signals, f);

  // connect to parent
  signals.forEach(function (parent) {
    parent.children.push(mapped);
  });

  return mapped;
}

module.exports = {
  Signal: Signal,
  Source: Source,
  source: source,
  combine: combine,
  initSignal: initSignal,
};
