/**
  Inspired by [simple counter](http://baconjs.github.io/)

  Implemented in *menrva*, [Bacon.js](https://github.com/baconjs/bacon.js) and [RxJS](https://github.com/Reactive-Extensions/RxJS).

  Bacon.js and RxJS variants, come in two flavours, *direct* and *data-flowish*.
*/
$(function () {
  "use strict";

  var MIN_VALUE = 0;

  var $value = menrva.source(0);

  $value.onValue(function (x) {
    $("#counter").text(x);
  });

  $value.onValue(function (x) {
    var down = $("#down");
    if (x <= MIN_VALUE) {
      down.attr("disabled", "disabled");
    } else {
      down.removeAttr("disabled");
    }
  });

  function inc(x) {
    return x + 1;
  }

  function dec(x) {
    return Math.max(MIN_VALUE, x - 1);
  }

  $("#up").click(function () {
    var tx = menrva.transaction();
    $value.modify(tx, inc);
    tx.commit();
  });

  $("#down").click(function () {
    var tx = menrva.transaction();
    $value.modify(tx, dec);
    tx.commit();
  });
});
