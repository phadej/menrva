/**
  Inspired by [simple counter](http://baconjs.github.io/)
*/
$(function () {
  "use strict";

  var MIN_VALUE = 0;

  var upButton = $("#up");
  var downButton = $("#down");
  var counterEl = $("#counter");

  var $up   = upButton.asEventStream("click");
  var $down = downButton.asEventStream("click");

  /**
    ## Original &mdash; direct approach
  */
  var $counter =
    // map up to 1, down to -1
    $up.map(1).merge($down.map(-1))
    // accumulate sum
      .scan(0, function(x,y) { return Math.max(MIN_VALUE, x + y); });

  /**
     ## State transformation approach

     This is almost the same as previous. Yet parameters of `scan` are generic.
     All of logic is bundled into state transformation functions.
  */

  function constant(x) {
    return function () {
      return x;
    };
  }

  function inc(x) {
    return x + 1;
  }

  function dec(x) {
    return Math.max(MIN_VALUE, x - 1);
  }

  $counter = Bacon.mergeAll($up.map(constant(inc)), $down.map(constant(dec)))
    .scan(0, function (state, f) { return f(state); });

  /**
    ## Render

    Assign observable value to jQuery property text
  */
  $counter.assign(counterEl, "text");

  $counter.onValue(function (x) {
    if (x <= MIN_VALUE) {
      downButton.attr("disabled", "disabled");
    } else {
      downButton.removeAttr("disabled");
    }
  });
});
