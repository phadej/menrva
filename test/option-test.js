"use strict";

var menrva = require("../lib/menrva.js");
var assert = require("assert");
var _ = require("lodash");

describe("Option", function () {
  describe("map", function () {
    describe("is a functor map", function () {
      it("— identity law", function () {
        var values = [
          menrva.some(1),
          menrva.some(2),
          menrva.none,
        ];

        _.each(values, function (v) {
          assert(v.map(_.identity).equals(v));
        });
      });

      it("— composition law", function () {
        function f(x) {
          return x + 1;
        }

        function g(x) {
          return x * 2;
        }

        var values = [
          menrva.some(1),
          menrva.some(2),
          menrva.none,
        ];

        _.each(values, function (v) {
          assert(v.map(f).map(g).equals(v.map(_.compose(g, f))));
        });
      });
    });
  });

  describe("orElse", function () {
    it("unwraps options", function () {
      var e = 5;
      var values = [
        [menrva.some(1), 1],
        [menrva.some(2), 2],
        [menrva.none, e],
      ];

      _.each(values, function (p) {
        var v = p[0];
        var r = p[1];

        assert(v.orElse(e) === r);
      });
    });
  });
});
