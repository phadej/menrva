"use strict";

var menrva = require("../src/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");

describe("corner cases", function () {
  it("combine with itself", function () {
    var a = menrva.source(1);
    var combineCount = 0;
    var b = menrva.combine(a, a, a, function (x, y, z) {
      combineCount += 1;
      return x + y + z;
    });
    var onValueCount = 0;
    b.onValue(function () {
      onValueCount += 1;
    })

    chai.expect(b.value).to.equal(3);
    chai.expect(combineCount).to.equal(1);
    chai.expect(onValueCount).to.equal(1);

    var tx = menrva.transaction();
    a.set(tx, 2);
    tx.commit();

    chai.expect(b.value).to.equal(6);
    chai.expect(combineCount).to.equal(2);
    chai.expect(onValueCount).to.equal(2);
  });
});
