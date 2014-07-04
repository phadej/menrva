"use strict";

var menrva = require("../lib/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");

describe("signal", function () {
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

  describe("modify", function () {
    it("makes possible to modify current value of the signal", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx1 = menrva.transaction();
      a.set(tx1, 2);
      a.modify(tx1, function (x) { return x * x; });
      tx1.commit();

      chai.expect(c.value).to.equal(9);
      chai.expect(count).to.equal(2);

      var tx2 = menrva.transaction();
      a.modify(tx2, function (x) { return x * x; });
      tx2.commit();

      chai.expect(c.value).to.equal(33);
      chai.expect(count).to.equal(3);
    });
  });

  describe("unsubscriber", function () {
    it("let you unsubscribe, duh!", function () {
      var count = 0;
      var unsub = c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx1 = menrva.transaction();
      a.set(tx1, 2);
      tx1.commit();

      chai.expect(c.value).to.equal(5);
      chai.expect(count).to.equal(2);

      unsub();

      var tx2 = menrva.transaction();
      a.set(tx2, 3);
      tx2.commit();

      chai.expect(c.value).to.equal(7);
      chai.expect(count).to.equal(2);

      // you can unsub many times - second and following calls are no-op
      unsub();

      var tx3 = menrva.transaction();
      a.set(tx3, 2);
      tx3.commit();

      chai.expect(c.value).to.equal(5);
      chai.expect(count).to.equal(2);
    });
  });
});
