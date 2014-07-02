!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jsc=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

var option = _dereq_("./option");

module.exports = {
  some: option.some,
  none: option.none,
};

},{"./option":2}],2:[function(_dereq_,module,exports){
/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

// typify: instance Option
// Option type
function Option() {}

// Some
function Some(x) {
  this.value = x;
}

Some.prototype = new Option();

function some(x) {
  return new Some(x);
}

// None
function None() {}

None.prototype = new Option();

var none = new None();

// Methods

// equals
Some.prototype.equals = function (other) {
  return other instanceof Some && this.value === other.value; // TODO: use egal
};

None.prototype.equals = function (other) {
  // only one instance of `none`
  return this === other;
};

// map
// :: fn -> Option
Some.prototype.map = function (f) {
  return some(f(this.value));
};

// :: fn -> Option
None.prototype.map = function (f) {
  return none;
};

// orElse
Some.prototype.orElse = function (x) {
  return this.value;
};

None.prototype.orElse = function (x) {
  return x;
};

module.exports = {
  some: some,
  none: none,
};

},{}]},{},[1])
(1)
});