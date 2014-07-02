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
