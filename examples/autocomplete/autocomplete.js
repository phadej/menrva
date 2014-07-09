/**
    Inspired by [RxJS autocomplete example](https://github.com/Reactive-Extensions/RxJS/tree/master/examples/autocomplete)
*/
$(function () {
    "use strict";

  var inputElement = $("#searchtext");
  var resultsElement = $("#results");

  var $searchText = menrva.source(inputElement.val());
  var $searchCache = menrva.source({}, _.isEqual);

  var LOADING = "loading...";

  // update $searchText
  inputElement.keyup(function (ev) {
    var text = ev.target.value;
    var tx = menrva.transaction();
    $searchText.set(tx, text);
    $searchCache.modify(tx, function (searchCache) {
      if (_.has(searchCache, text)) {
        return searchCache;
      } else {
        var newCache = _.extend({}, searchCache);
        newCache[text] = null;
        return newCache;
      }
    });
    tx.commit(); 
  });

  menrva.combine($searchText, $searchCache, function (searchText, searchCache) {
    return searchCache[searchText];
  }).onValue(function (searchResult) {
    if (searchResult) {
      resultsElement.empty();

      if (searchResult === LOADING) {
        resultsElement.html("<li>Loading...<li>");
      } else {
        $.each(searchResult, function (key, value) {
         $("<li>").text(value).appendTo(resultsElement);
        });
      }
    }
  });

  // Search Wikipedia for a given term
  function searchWikipedia (term) {
    // set we are searching the term
    var tx = menrva.transaction();
    $searchCache.modify(tx, function (searchCache) {
      var add = {};
      add[term] = LOADING;
      return _.extend({}, searchCache, add);   
    });
    tx.commit();

    return $.ajax({
      url: "http://en.wikipedia.org/w/api.php",
      dataType: "jsonp",
      data: {
        action: "opensearch",
        format: "json",
        search: window.encodeURI(term)
      }
    })
    .then(function (searchResult) {
      var restx = menrva.transaction();
      $searchCache.modify(restx, function (searchCache) {
        var newCache = _.extend({}, searchCache);
        newCache[term] = searchResult[1];
        return newCache;
      });
      restx.commit();
    });
  }

  var throttledSearchWikipedia = _.throttle(searchWikipedia, 750);

  menrva.combine($searchText, $searchCache, function (a, b) { return [a, b]; })
    .onValue(function (p) {
      var searchText = p[0];
      var searchCache = p[1];
      if (searchText.length > 2 && !searchCache[searchText]) {
        throttledSearchWikipedia(searchText);
      }
    });
});
