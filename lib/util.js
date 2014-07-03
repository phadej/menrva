/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

function identity(x) {
  return x;
}

function pluck(arr, property) {
  var len = arr.length;
  var res = new Array(len);
  for (var i = 0; i < len; i++) {
    res[i] = arr[i][property];
  }
  return res;
}

module.exports = {
  identity: identity,
  pluck: pluck,
};
