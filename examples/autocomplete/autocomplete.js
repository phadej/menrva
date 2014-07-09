/**
    Inspired by [RxJS autocomplete example](https://github.com/Reactive-Extensions/RxJS/tree/master/examples/autocomplete)
*/
$(function () {
    "use strict";

  var inputElement = $("#searchtext");
  var resultsElement = $("#results");

  var $searchText = menrva.source(inputElement.val());
  var $searchCache = menrva.source({}, _.isEqual);
  var $searchResult = menrva.combine($searchText, $searchCache, function (searchText, searchCache) {
    return searchCache[searchText];
  });

  var LOADING = "loading...";

  // update $searchText
  inputElement.keyup(function (ev) {
    var text = ev.target.value;
    menrva.transaction()
      .set($searchText, text)
      .commit();
  });

  $searchResult.onValue(function (searchResult) {
    if (searchResult) {
      resultsElement.empty();

      if (searchResult === LOADING) {
        resultsElement.html("<li>Loading...</li>");
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
    menrva.transaction()
      .modify($searchCache, function (searchCache) {
        var add = {};
        add[term] = LOADING;
        return _.extend({}, searchCache, add);
      })
      .commit();

    // Perform the fetch
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
      menrva.transaction()
        .modify($searchCache, function (searchCache) {
          var newCache = _.extend({}, searchCache);
          newCache[term] = searchResult[1];
          return newCache;
        })
        .commit();
    });
  }

  var throttledSearchWikipedia = _.throttle(searchWikipedia, 750);

  // if there isn't result, perform it.
  menrva.tuple($searchText, $searchResult).onSpread(function (searchText, searchResult) {
    if (searchText.length > 2 && !searchResult) {
      throttledSearchWikipedia(searchText);
    }
  });
});
