"use strict";

var menrva = require("../lib/menrva.js");
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
    a = new menrva.Source(1);
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

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      a.set(transaction, 3);
      transaction.commit();

      chai.expect(c.value).to.equal(7);
      chai.expect(count).to.equal(2);
    });

    it("last one wins, equality", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      a.set(transaction, 1);
      transaction.commit();

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);
    });
  });

  describe("rollback", function () {
    it("resets the transaction", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      transaction.rollback();

      // TODO: we can make this either fail for rollbacked transactions, or let set's do nothing
      transaction.commit();

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);
    });

    it("can be called multiple times", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      transaction.rollback();
      transaction.rollback();

      // TODO: we can make this either fail for rollbacked transactions, or let set's do nothing
      transaction.commit();

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);
    });
  });

  it("will eventually auto-commit", function (done) {
    var count = 0;
    c.onValue(function (y) {
      count += 1;
    });

    chai.expect(c.value).to.equal(3);
    chai.expect(count).to.equal(1);

    var transaction = new menrva.Transaction();
    a.set(transaction, 2);

    setTimeout(function () {
      chai.expect(c.value).to.equal(5);
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
    a = new menrva.Source(1);
    b = new menrva.Source(2);
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

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      b.set(transaction, 3);
      transaction.commit();

      chai.expect(c.value).to.equal(5);
      chai.expect(count).to.equal(2);
    });

    it("skipping duplicates", function () {
      var count = 0;
      c.onValue(function (y) {
        count += 1;
      });

      chai.expect(c.value).to.equal(3);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      b.set(transaction, 1);
      transaction.commit();

      chai.expect(c.value).to.equal(3);
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
    a = new menrva.Source(1);
    b = new menrva.Source(2);
    c = new menrva.Source(3);
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

      chai.expect(e.value).to.equal(6);
      chai.expect(count).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      b.set(transaction, 3);
      transaction.commit();

      chai.expect(e.value).to.equal(8);
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

      chai.expect(d.value).to.equal(3);
      chai.expect(e.value).to.equal(6);
      chai.expect(countD).to.equal(1);
      chai.expect(countE).to.equal(1);

      var transaction = new menrva.Transaction();
      a.set(transaction, 2);
      b.set(transaction, 3);
      c.set(transaction, 1);
      transaction.commit();

      chai.expect(d.value).to.equal(5);
      chai.expect(e.value).to.equal(6);
      chai.expect(countD).to.equal(2);
      chai.expect(countE).to.equal(1);
    });
  });
});
