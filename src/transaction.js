/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

var util = require("./util.js");

/**
  ### Transaction

  One gathers atomic updates into single transaction (to avoid glitches).

  ```js
  var tx = menrva.transaction();
  sourceA.set(tx, 42);
  sourceB.set(tx, "foobar");
  tx.commit(); // not necessary, transactions are auto-commited
  ```
*/
function Transaction() {
  this.actions = [];
  this.commitScheduled = false;
}

/**
  #### transaction

  > transaction () : Transaction

  Create transaction.
*/
function transaction() {
  return new Transaction();
}

/**
  #### transaction.commit

  Commit the transaction, forcing synchronous data propagation.
*/

function calculateUpdates(actions) {
  var updates = {};
  var len = actions.length;
  for (var i = 0; i < len; i++) {
    var action = actions[i];
    // find update fact for signal
    var update = updates[action.signal.index];

    // if not update found, create new for action's signal
    if (!update) {
      update = {
        signal: action.signal,
        value: action.signal.value,
      };
      updates[action.signal.index] = update;
    }

    // perform action
    switch (action.type) {
      case "set":
        update.value = action.value;
        break;
      case "modify":
        update.value = action.f(update.value);
        break;
    }
  }

  return util.values(updates);
}

function initialSet(updates) {
  var updated = [];
  var len = updates.length;
  for (var i = 0; i < len; i++) {
    var update = updates[i];
    // if different value
    if (!update.signal.eq(update.signal.value, update.value)) {
      // set it
      update.signal.value = update.value;

      // collect updated source signal
      updated.push(update.signal);
    }
  }
  return updated;
}

function triggerOnValue(updated) {
  var len = updated.length;
  for (var i = 0; i < len; i++) {
    var updatedSignal = updated[i];
    var value = updatedSignal.value;
    var callbacks = updatedSignal.callbacks;
    var callbacksLen = callbacks.length;
    for (var j = 0; j < callbacksLen; j++) {
      callbacks[j](value);
    }
  }
}

Transaction.prototype.commit = function () {
  // clear timeout
  if (this.commitScheduled) {
    clearTimeout(this.commitScheduled);
    this.commitScheduled = false;
  }

  // If nothing to do, short circuit
  if (this.actions.length === 0) {
    return;
  }

  // Data flow

  // traverse actions to aquire new values
  var updates = calculateUpdates(this.actions);

  // Apply updates, and collect updated signals
  var updated = initialSet(updates);

  // seed propagation push-pull propagation with children of updated sources
  var signals = [];
  updated.forEach(function (update) {
    update.children.forEach(function (child) {
      if (signals.indexOf(child) === -1) {
        signals.push(child);
      }
    });
  });

  // until there aren't any signals
  while (signals.length !== 0) {
    var len = signals.length;

    // minimum rank
    var rank = Math.min.apply(Math, util.pluck(signals, "rank"));

    for (var i = 0; i < len; i++) {
      var signal = signals[i];
      // skip signals of different (larger!) rank
      if (signal.rank !== rank) {
        continue;
      }

      // new value
      var value = signal.calculate();

      // if value is changed
      if (!signal.eq(signal.value, value)) {
        // set the value
        signal.value = value;

        // add signal to updated list
        updated.push(signal);

        // add children of updated signal to list of traversable signals
        var childrenlen = signal.children.length;
        for (var j = 0; j < childrenlen; j++) {
          var child = signal.children[i];
          if (signals.indexOf(child) === -1) {
            signals.push(child);
          }
        }
      }

      // we are done with this signal
      signals[i] = undefined;
    }

    // clear checked signals (undefined thus falsy)
    signals = signals.filter(util.identity);
  }

  // Trigger onValue callbacks
  triggerOnValue(updated);

  // rest cleanup
  this.actions = [];
};

/**
  #### transaction.rollback

  Rollback the transaction. Maybe be called multiple times (consecutives calls are no-op).

  *Note: for now `rollback` only resets the pending actions in transactions. Transaction is still valid, and more actions can be added*
*/
Transaction.prototype.rollback = function() {
  if (this.commitScheduled) {
    clearTimeout(this.commitScheduled);
  }
  this.actions = [];
  this.commitScheduled = false;
};

Transaction.prototype.deferCommit = function () {
  if (!this.commitScheduled) {
    var tx = this;
    this.commitScheduled = setTimeout(function () {
      tx.commit();
    });
  }
};

Transaction.prototype.addAction = function (action) {
  this.actions.push(action);
  this.deferCommit();
};

module.exports = transaction;
