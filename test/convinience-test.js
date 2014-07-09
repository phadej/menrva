"use strict";

var menrva = require("../src/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");
var sinon = require("sinon");

describe("convinience features", function () {
  beforeEach(function () {
    sinon.stub(console, "log");
  });
  afterEach(function () {
    console.log.restore();
  });
  it("log", function () {
    var a = menrva.source(1);
    a.log("foo", "bar");

    chai.expect(console.log.args).to.deep.equal([["foo", "bar", 1]]);
  });
});
