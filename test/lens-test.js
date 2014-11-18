"use strict";

var menrva = require("../src/menrva.js");
var assert = require("assert");
var _ = require("lodash");
var chai = require("chai");

describe("zoom", function () {
  var a, b, c, d, e, f;
  var bCount, cCount, dCount, eCount, fCount;
  beforeEach(function () {
    a = menrva.source({
      foo: {
        bar: 1,
        baz: 2,
      },
      quux: "hello world"
    });

    b = a.zoom("foo.bar");
    c = a.zoom("quux");
    d = a.zoom("not.here");
    e = a.zoom("foo", _.isEqual);
    f = e.zoom("baz");

    bCount = cCount = dCount = eCount = fCount = 0;
    b.onValue(function () { bCount += 1; });
    c.onValue(function () { cCount += 1; });
    d.onValue(function () { dCount += 1; });
    e.onValue(function () { eCount += 1; });
    f.onValue(function () { fCount += 1; });
  });

  it("get functionality", function () {
    chai.expect(b.value()).to.equal(1);
    chai.expect(c.value()).to.equal("hello world");
    chai.expect(d.value()).to.equal(undefined);
  });

  it("set functionality - parent", function () {
    chai.expect(bCount).to.equal(1);
    chai.expect(cCount).to.equal(1);
    chai.expect(dCount).to.equal(1);
    chai.expect(eCount).to.equal(1);
    chai.expect(fCount).to.equal(1);

    var tx = menrva.transaction();
    a.set(tx, {
      foo: {
        bar: 2,
        baz: 2,
      },
      quux: "hello world"
    });
    tx.commit();

    chai.expect(b.value()).to.equal(2);
    chai.expect(c.value()).to.equal("hello world");
    chai.expect(d.value()).to.equal(undefined);
    chai.expect(e.value()).to.deep.equal({bar: 2, baz: 2});
    chai.expect(f.value()).to.equal(2);

    chai.expect(bCount).to.equal(2);
    chai.expect(cCount).to.equal(1);
    chai.expect(dCount).to.equal(1);
    chai.expect(eCount).to.equal(2);
    chai.expect(fCount).to.equal(1);
  });

  it("set functionality - thru lens", function () {
    var tx = menrva.transaction();
    b.set(tx, 3);
    tx.commit();    

    chai.expect(b.value()).to.equal(3);
    chai.expect(e.value()).to.deep.equal({ bar: 3, baz: 2});
    chai.expect(f.value()).to.equal(2);

    chai.expect(bCount).to.equal(2);
    chai.expect(cCount).to.equal(1);
    chai.expect(dCount).to.equal(1);
    chai.expect(eCount).to.equal(2);
    chai.expect(fCount).to.equal(1);
  });

  it("set functionality - thru lens, absent path", function () {
    var tx = menrva.transaction();
    d.set(tx, "something");
    tx.commit();

    chai.expect(a.value()).to.deep.equal({
      foo: {
        bar: 1,
        baz: 2
      },
      quux: "hello world",
      not: {
        here: "something",
      }
    });

    chai.expect(bCount).to.equal(1);
    chai.expect(cCount).to.equal(1);
    chai.expect(dCount).to.equal(2);
    chai.expect(eCount).to.equal(1);
    chai.expect(fCount).to.equal(1);
  });

  it("modify functionality - thru lens", function () {
    var tx = menrva.transaction();
    b.modify(tx, function (x) {
      return x * 3;
    });
    tx.commit();    

    chai.expect(b.value()).to.equal(3);
    chai.expect(e.value()).to.deep.equal({ bar: 3, baz: 2});
    chai.expect(f.value()).to.equal(2);

    chai.expect(bCount).to.equal(2);
    chai.expect(cCount).to.equal(1);
    chai.expect(dCount).to.equal(1);
    chai.expect(eCount).to.equal(2);
    chai.expect(fCount).to.equal(1);
  });

  it("set functionality - thru lens, absent path", function () {
    var tx = menrva.transaction();
    d.modify(tx, function (x) {
      return x;
    });
    tx.commit();

    chai.expect(a.value()).to.deep.equal({
      foo: {
        bar: 1,
        baz: 2
      },
      quux: "hello world",
      not: {
        here: undefined, // not it exists, though undefined
      }
    });

    chai.expect(bCount).to.equal(1);
    chai.expect(cCount).to.equal(1);
    chai.expect(dCount).to.equal(1);
    chai.expect(eCount).to.equal(1);
    chai.expect(fCount).to.equal(1);
  });
});
