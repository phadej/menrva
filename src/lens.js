/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

var util = require("./util.js");
var signal = require("./signal.js");

/**
  ### Lens

  Lenses are composable functional references.
  They allow you to *access* and *modify* data potentially very deep within a structure!
*/
function Lens(parent, path, eq) {
  this.parents = [parent];
  this.path = path.split(/\./);
  var value = this.calculate();
  signal.initSignal(this, value, eq);
}

Lens.prototype = new signal.Signal();

Lens.prototype.calculateRank = function () {
  return this.parents[0].rank + 1;
};

Lens.prototype.calculate = function () {
  return util.getPath(this.parents[0].v, this.path);
};

/**
  #### source.zoom

  > zoom (@ : Source a, path : Path a b, eq = egal : b -> b -> boolean) : Source b

  Zoom (or focus) into part specified by `path` of the original signal.
  One can `set` and `modify` zoomed signals, they act as sources.

  ```js
  var quux = source.zoom("foo.bar.quux");
  ```
*/
signal.Source.prototype.zoom = Lens.prototype.zoom = function(f, eq) {
  var mapped = new Lens(this, f, eq);
  this.children.push(mapped);
  return mapped;
};

Lens.prototype.set = function (tx, value) {
  var path = this.path;
  this.parents[0].modify(tx, function (obj) {
    return util.setPath(obj, path, value);
  });
};

Lens.prototype.modify = function (tx, f) {
  var path = this.path;
  this.parents[0].modify(tx, function (obj) {
    return util.modifyPath(obj, path, f);
  });
};
