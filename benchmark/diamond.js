var Benchmark = require("benchmark");
var menrva = require("../src/menrva.js");
var Bacon = require("baconjs");
var BaconModel = require("bacon.model");
var Rx = require("rx");

var WIDTH = 3;
var DEPTH = 5;

var INITIAL_VALUE = 1;

function inc(x) {
  return x + 1;
}

function plus() {
  var sum = 0;
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    sum += arguments[i];
  }
  return sum;
}

function diamond(src, width, depth, combinator) {
  if (depth === 0) {
    return src;
  } else {
    var branches = [];
    for (var i = 0; i < width; i++) {
      branches.push(diamond(src.map(inc), width, depth - 1, combinator));
    }
    return combinator(branches);
  }
}

// Bacon
var baconBus = new Bacon.Bus();
function baconCombine(array) {
  array = [plus].concat(array);
  return Bacon.combineWith.apply(undefined, array);
}
var baconDiamond = diamond(baconBus, WIDTH, DEPTH, baconCombine);

// Bacon property
var baconPropertyBus = new Bacon.Bus();
var baconProperty = baconPropertyBus.toProperty(INITIAL_VALUE);
var baconPropertyDiamond = diamond(baconProperty, WIDTH, DEPTH, baconCombine);

// Bacon model
var baconModel = new BaconModel.Model(INITIAL_VALUE);
function baconModelCombine(array) {
  array = [plus].concat(array);
  return BaconModel.combineWith.apply(undefined, array);
}
var baconModelDiamond = diamond(baconModel, WIDTH, DEPTH, baconModelCombine);

// Rx
var rxSubject = new Rx.Subject();
function rxCombine(array) {
  array = array.concat([plus]);
  return Rx.Observable.zip.apply(undefined, array);
}
var rxDiamond = diamond(rxSubject, WIDTH, DEPTH, rxCombine);

// Menrva
var menrvaSource = menrva.source(INITIAL_VALUE);
function menrvaCombine(array) {
  array = array.concat([plus]);
  return menrva.combine.apply(undefined, array);
}
var menrvaDiamond = diamond(menrvaSource, WIDTH, DEPTH, menrvaCombine);

// Verify correctness:
var unsub, disposable;

unsub = baconDiamond.onValue(function (x) {
  console.log("Bacon.js:             ", x);
});
baconBus.push(INITIAL_VALUE);
unsub();

unsub = baconPropertyDiamond.onValue(function (x) {
  console.log("Bacon.js Bus→Property:", x);
});
unsub();

unsub = baconModelDiamond.onValue(function (x) {
  console.log("Bacon.js Model:       ", x);
});
unsub();

disposable = rxDiamond.subscribe(function (x) {
  console.log("Rx.JS Cold:           ", x);
});
rxSubject.onNext(INITIAL_VALUE);
disposable.dispose();

unsub = menrvaDiamond.onValue(function (x) {
  console.log("menrva:               ", x);
});
unsub();

// Add callack
baconDiamond.onValue(function (x) {});
baconPropertyDiamond.onValue(function (x) {});
baconModelDiamond.onValue(function (x) {});
rxDiamond.subscribe(function (x) {});
menrvaDiamond.onValue(function (x) {});

// Options
Benchmark.options.maxTime = 10;
Benchmark.options.minSamples = 200;

// Suite
var suite = new Benchmark.Suite();
suite.add("Bacon.js", function () {
  baconBus.push(Math.random());
});
suite.add("Bacon.js Bus→Property", function () {
  baconPropertyBus.push(Math.random());
});
suite.add("Bacon.js Model", function () {
  baconModel.set(Math.random());
});
suite.add("Rx.JS Cold", function () {
  rxSubject.onNext(Math.random());
});
suite.add("menrva", function (x) {
  var tx = menrva.transaction();
  menrvaSource.set(tx, Math.random());
  tx.commit();
});

// Run suite;
suite
.on("cycle", function(event) {
  console.log(String(event.target));
})
.on("complete", function() {
  console.log("Fastest is " + this.filter("fastest").pluck("name"));
})
// run async
.run();
