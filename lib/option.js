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

// typify: instance Option
// Option type

/**
  ### Option

  Also known as `Maybe`.
*/
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

/**
  #### option.equals

  > equals (@ : option a, other : *, eq = eqal : a -> a -> boolean) : boolean

  Equality check.
*/
Some.prototype.equals = function (other, eq) {
  eq = eq || egal;
  return other instanceof Some && eq(this.value, other.value); // TODO: use egal
};

None.prototype.equals = function (other) {
  // only one instance of `none`
  return this === other;
};

/**
  #### option.map

  > map (@ : option a, f : a -> b) : option b
*/
// :: fn -> Option
Some.prototype.map = function (f) {
  return some(f(this.value));
};

// :: fn -> Option
None.prototype.map = function (f) {
  return none;
};

/**
  #### option.elim

  > elim (@ : option a, x : b, f : a -> b) : b

*/
Some.prototype.elim = function (x, f) {
  return f(this.value);
};

None.prototype.elim = function (x, f) {
  return x;
};

/**
  #### option.orElse

  > orElse (@ : option a, x : a) : a
*/
Option.prototype.orElse = function (x) {
  return this.elim(x, util.identity);
};

module.exports = {
  some: some,
  none: none,
};
