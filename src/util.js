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

function values(obj) {
  var arr = [];
  for (var k in obj) {
    arr.push(obj[k]);
  }
  return arr;
}

function objIsEmpty(obj) {
  /* jshint unused:false */
  for (var k in obj) {
    return false;
  }
  return true;
}

function getPath(obj, path) {
  var len = path.length;
  for (var i = 0; i < len; i++) {
    if (obj === undefined || obj === null) {
      return obj;
    } else {
      obj = obj[path[i]];
    }
  }
  return obj;
}

function setProperty(obj, property, value) {
  var copy = {};
  for (var k in obj) {
    copy[k] = obj[k];
  }
  copy[property] = value;
  return copy;
}

function setPath(obj, path, value) {
  var len = path.length;
  var acc = value;
  for (var i = len; i > 0; i--) {
    var next = getPath(obj, path.slice(0, i - 1));
    acc = setProperty(next, path[i - 1], acc);
  }
  return acc;
}

function modifyPath(obj, path, f) {
  return setPath(obj, path, f(getPath(obj, path)));
}

module.exports = {
  identity: identity,
  pluck: pluck,
  values: values,
  objIsEmpty: objIsEmpty,
  getPath: getPath,
  setPath: setPath,
  modifyPath: modifyPath,
};
