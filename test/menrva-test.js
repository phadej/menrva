"use strict";

var menrva = require("../lib/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");

describe("menrva", function () {
  it("was an Etruscan goddess of war, art, wisdom and health.", function () {
    assert(true);
  });
});

describe("triangle shape", function () {
  /*
    a = source()
    b = a + 1
    c = a + b =  2 * a + 1
  */
  var a, b, c;
  beforeEach(function () {
    a = menrva.source(1);
    b = a.map(function (x) { return x + 1; });
    c = menrva.combine(a, b, function (x, y) {
      return x + y;
    });
  });

  describe("initial case", function () {
    it("value is calculated already", function () {
      chai.expect(c.value).to.equal(3);
    });
    
    it("when adding onValue callback, it's executed synchronously", function () {
      var x = 2;
      var count = 0;
      c.onValue(function (y) {
        x = y;
        count += 1;
      });
      chai.expect(x).to.equal(3);
      chai.expect(count).to.equal(1);
    });
  });

  it("updating", function () {
    var count = 0;
    c.onValue(function (y) {
      count += 1;
    });

    chai.expect(c.value).to.equal(3);
    chai.expect(count).to.equal(1);

    var tx = menrva.transaction();
    a.set(tx, 2);

    chai.expect(c.value).to.equal(3);
    chai.expect(count).to.equal(1);

    tx.commit();

    chai.expect(c.value).to.equal(5);
    chai.expect(count).to.equal(2);
  });
});
