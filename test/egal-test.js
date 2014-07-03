"use strict";

var menrva = require("../lib/menrva.js");
var assert = require("assert");

describe("egal", function () {
  it("consider nan's as equal", function () {
    assert(menrva.egal(NaN, NaN));
  });

  it("consider +0 and -0 non-equal", function () {
    assert(!menrva.egal(+0, -0));
  });
});
