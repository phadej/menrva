"use strict";

var menrva = require("../src/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");

describe("transaction", function () {
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

  describe("multiple sets", function () {
    it("last one wins", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      a.set(tx, 3);
      tx.commit();

      chai.expect(c.value()).to.equal(7);
      chai.expect(count).to.equal(2);
    });

    it("last one wins, equality", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      a.set(tx, 1);
      tx.commit();

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);
    });
  });

  describe("rollback", function () {
    it("resets the transaction", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      tx.rollback();

      // TODO: we can make this either fail for rollbacked transactions, or let set's do nothing
      tx.commit();

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);
    });

    it("can be called multiple times", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      tx.rollback();
      tx.rollback();

      // TODO: we can make this either fail for rollbacked transactions, or let set's do nothing
      tx.commit();

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);
    });
  });

  it("will eventually auto-commit", function (done) {
    var count = 0;
    c.onValue(function (y) {
      count += 1;
    });

    chai.expect(c.value()).to.equal(3);
    chai.expect(count).to.equal(1);

    var tx = menrva.transaction();
    a.set(tx, 2);

    setTimeout(function () {
      chai.expect(c.value()).to.equal(5);
      chai.expect(count).to.equal(2);
      done();
    }, 10)
  });
});

describe("transaction - a + b", function () {
  /*
    a = source()
    b = source()
    c = a + b
  */
  var a, b, c;
  beforeEach(function () {
    a = menrva.source(1);
    b = menrva.source(2);
    c = menrva.combine(a, b, function (x, y) {
      return x + y;
    });
  });

  describe("multiple sets", function () {
    it("inside single transaction", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      b.set(tx, 3);
      tx.commit();

      chai.expect(c.value()).to.equal(5);
      chai.expect(count).to.equal(2);
    });

    it("skipping duplicates", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      b.set(tx, 1);
      tx.commit();

      chai.expect(c.value()).to.equal(3);
      chai.expect(count).to.equal(1);
    });
  });
});

describe("transaction - a + b + c", function () {
  /*
    a = source()
    b = source()
    c = source();
    d = a + b
    e = d + c = a + b + c
  */
  var a, b, c, d, e;
  beforeEach(function () {
    a = menrva.source(1);
    b = menrva.source(2);
    c = menrva.source(3);
    d = menrva.combine(a, b, function (x, y) {
      return x + y;
    });
    e = menrva.combine(d, c, function (x, y) {
      return x + y;
    });
  });

  describe("multiple sets", function () {
    it("inside single transaction", function () {
      var count = 0;
      e.onValue(function (y) {
        count += 1;
      });

      chai.expect(e.value()).to.equal(6);
      chai.expect(count).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      b.set(tx, 3);
      tx.commit();

      chai.expect(e.value()).to.equal(8);
      chai.expect(count).to.equal(2);
    });

    it("skipping duplicates", function () {
      var countD = 0;
      d.onValue(function (y) {
        countD += 1;
      });

      var countE = 0;
      e.onValue(function (y) {
        countE += 1;
      });

      chai.expect(d.value()).to.equal(3);
      chai.expect(e.value()).to.equal(6);
      chai.expect(countD).to.equal(1);
      chai.expect(countE).to.equal(1);

      var tx = menrva.transaction();
      a.set(tx, 2);
      b.set(tx, 3);
      c.set(tx, 1);
      tx.commit();

      chai.expect(d.value()).to.equal(5);
      chai.expect(e.value()).to.equal(6);
      chai.expect(countD).to.equal(2);
      chai.expect(countE).to.equal(1);
    });
  });

  describe("syntax", function () {
    var a, b;

    function double(x) {
      return x + x;
    }

    beforeEach(function () {
      a = menrva.source(1);
      b = menrva.source(2);
    });

    it("imperative", function () {
      chai.expect(a.value()).to.equal(1);
      chai.expect(b.value()).to.equal(2);

      var tx = menrva.transaction();
      a.set(tx, 42);
      b.modify(tx, double);
      tx.commit();

      chai.expect(a.value()).to.equal(42);
      chai.expect(b.value()).to.equal(4);
    });

    it("chain", function () {
      chai.expect(a.value()).to.equal(1);
      chai.expect(b.value()).to.equal(2);

      menrva.transaction()
        .set(a, 42)
        .modify(b, double)
        .commit();

      chai.expect(a.value()).to.equal(42);
      chai.expect(b.value()).to.equal(4);
    });

    it("short", function () {
      chai.expect(a.value()).to.equal(1);
      chai.expect(b.value()).to.equal(2);

      menrva.transaction([a, 42, b, double]).commit();

      chai.expect(a.value()).to.equal(42);
      chai.expect(b.value()).to.equal(4);
    });
  });
});
