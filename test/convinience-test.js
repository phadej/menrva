"use strict";

var menrva = require("../src/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");
var sinon = require("sinon");

describe("convinience features", function () {
  describe("log", function () {
    beforeEach(function () {
      sinon.stub(console, "log");
    });
    afterEach(function () {
      console.log.restore();
    });

    it("is onValue(console.log)", function () {
      var a = menrva.source(1);
      a.log("foo", "bar");

      chai.expect(console.log.args).to.deep.equal([["foo", "bar", 1]]);
    });
  });

  describe("tuple - onSpread", function () {
    it("are convenient when you want to react to change in either signal", function () {
      var a = menrva.source(1);
      var b = menrva.source(2);

      var stub = sinon.stub();

      menrva.tuple(a, b).onSpread(stub);

      menrva.transaction([a, 3]).commit();
      menrva.transaction([b, 4]).commit();
      menrva.transaction([a, 5, b, 6]).commit();

      chai.expect(stub.args).to.deep.equal([
        [1, 2],
        [3, 2],
        [3, 4],
        [5, 6],
      ]);
    });
  });
});
