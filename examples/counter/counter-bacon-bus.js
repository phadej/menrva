/**
  Inspired by [simple counter](http://baconjs.github.io/)
*/
$(function () {
  "use strict";

  var MIN_VALUE = 0;

  var $valueBus = new Bacon.Bus();
  var $value = $valueBus.toProperty(0);

  $value.assign($("#counter"), "text");

  $value.onValue(function (x) {
    var down = $("#down");
    if (x <= MIN_VALUE) {
      down.attr("disabled", "disabled");
    } else {
      down.removeAttr("disabled");
    }
  }); 

  var $up   = $("#up").asEventStream("click");
  var $down = $("#down").asEventStream("click");

  var $events = $up.map(1).merge($down.map(-1));

  var $valueState = $events.scan(0, function(x,y) {
    return Math.max(MIN_VALUE, x + y);
  });

  $valueBus.plug($valueState);
});
