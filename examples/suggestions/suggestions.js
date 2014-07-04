/**
  Inspired by [*The introduction to Reactive Programming you've been missing*](http://jsfiddle.net/staltz/8jFJH/48) by [@andrestaltz](https://twitter.com/andrestaltz)

  This is [literated](https://github.com/phadej/ljs) javascript file.

  We start with usual jQuery prelude:
*/
$(function () {
  "use strict";

  /**
    ## Model
  
    The global state of this small widget consists of four variables: list of users and three random variables.

    As *signals* always have a value, we initialize the list of users with an empty list.

    As a notation, we use `$foo` for signals, and `foo` for their values.
    One may call this [Hungarian notation](http://en.wikipedia.org/wiki/Hungarian_notation).
  */
  var $users = menrva.source([]);
  var $fst = menrva.source(Math.random());
  var $snd = menrva.source(Math.random());
  var $trd = menrva.source(Math.random());

  /**
    ## Derived data

    After we identified the essential data pieces, everything else can be derived from them.

    We `combine` signals to get specific user for each slot in our widget.
  */
  function selectUser(users, rnd) {
    if (users.length === 0) {
      return undefined;
    } else {
      return users[Math.floor(rnd * users.length)];
    }
  }

  var $fstUser = menrva.combine($users, $fst, selectUser);
  var $sndUser = menrva.combine($users, $snd, selectUser);
  var $trdUser = menrva.combine($users, $trd, selectUser);

  /**
    ## Rendering

    Showing the suggestions is now easy. We only have to attach `onValue` callbacks to the user signals.

    `renderSuggestion` is exactly the same as in original jsfiddle.
  */

  function renderSuggestion(suggestedUser, selector) {
    var suggestionEl = document.querySelector(selector);
    if (suggestedUser === undefined) {
      suggestionEl.style.visibility = 'hidden';
  } else {
      suggestionEl.style.visibility = 'visible';
      var usernameEl = suggestionEl.querySelector('.username');
      usernameEl.href = suggestedUser.html_url;
      usernameEl.textContent = suggestedUser.login;
      var imgEl = suggestionEl.querySelector('img');
      imgEl.src = "";
      imgEl.src = suggestedUser.avatar_url;
    }
  }

  $fstUser.onValue(function (user) {
    renderSuggestion(user, '.suggestion1');
  });

  $sndUser.onValue(function (user) {
    renderSuggestion(user, '.suggestion2');
  });

  $trdUser.onValue(function (user) {
    renderSuggestion(user, '.suggestion3');
  });

  /**
    ## Events

    Events make our system tick. And here is the difference to RxJs implementation.
    *menrva* doesn't have any tools for working with events.
    This is intentional choice. For events one may use anything one likes.
    Pure callbacks, promises, even RxJS (it's awesome for event networks).

    As in this example event network is simple, we handle them directly.

    There are two event types: refresh and close. On refresh we fetch new user list,
    and set the value of `$users`.

    Here we use promises directly. 

    For handling one-to-one asynchronicity promises are very good abstraction.
    *menrva*, on the other hand, handles reactiviness.
  */

  function refresh() {
    var randomOffset = Math.floor(Math.random()*500);
    $.getJSON("https://api.github.com/users?since=" + randomOffset).then(function (response) {
      var tx = menrva.transaction();
      $users.set(tx, response);
      tx.commit();
    });
  }

  function randomize(source) {
    return function () {
      var tx = menrva.transaction();
      source.set(tx, Math.random());
      tx.commit();      
    };
  }

  // Initial populate
  refresh();

  // Event bindings
  var refreshButton = $('.refresh');
  var closeButton1 = $('.close1');
  var closeButton2 = $('.close2');
  var closeButton3 = $('.close3');

  refreshButton.click(refresh);

  closeButton1.click(randomize($fst));
  closeButton2.click(randomize($snd));
  closeButton3.click(randomize($trd));
});
