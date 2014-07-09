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
  sourceB.modify(tx, function (x) { return x + x; });
  tx.commit(); // not necessary, transactions are auto-commited
  ```

  There are also optional syntaxes for simple transactions:
  ```js
  menrva.transaction()
    .set(sourceA, 42)
    .modify(sourceB, function (x) { return x + x; })
    .commit();
  ```
  or even
  ```js
  menrva.transaction([sourceA, 42, sourceB, function(x) { return x + x; }]).commit();
  ```
*/
function Transaction() {
  this.actions = [];
  this.commitScheduled = false;
}

/**
  #### transaction

  > transaction (facts) : Transaction

  Create transaction.

  Shorthand syntax:

  > transaction ([sourceA, valueA, sourceB, valueB ...]) : Transaction

  If `value` is function, `source.modify(tx, value)` is called; otherwise `source.set(tx, value)`.
*/
function transaction(facts) {
  var tx = new Transaction();

  if (Array.isArray(facts)) {
    var len = facts.length;
    for (var i = 0; i < len; i += 2) {
      var source = facts[i];
      var value = facts[i + 1];
      if (typeof value === "function") {
        source.modify(tx, value);
      } else {
        source.set(tx, value);
      }
    }
  }

  return tx;
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
  var signals = {};
  updated.forEach(function (update) {
    update.children.forEach(function (child) {
      signals[child.index] = child;
    });
  });

  // until there aren't any signals
  while (!util.objIsEmpty(signals)) {
    // minimum rank
    var rank = Infinity;
    for (var rankK in signals) {
      rank = Math.min(rank, signals[rankK].rank);
    }

    var next = [];
    var curr = [];

    for (var k in signals) {
      var signal = signals[k];
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
        for (var childIdx = 0; childIdx < childrenlen; childIdx++) {
          var child = signal.children[childIdx];
          next.push(child);
        }
      }

      // we are done with this signal
      curr.push(signal.index);
    }

    // Remove traversed
    var currLen = curr.length;
    for (var currIdx = 0; currIdx < currLen; currIdx++) {
      delete signals[curr[currIdx]];
    }

    // add next
    var nextLen = next.length;
    for (var nextIdx = 0; nextIdx < nextLen; nextIdx++) {
      signals[next[nextIdx].index] = next[nextIdx];
    }
  }

  // Trigger onValue callbacks
  triggerOnValue(updated);

  // rest cleanupg
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

Transaction.prototype.set = function (source, value) {
  source.set(this, value);
  return this;
};

Transaction.prototype.modify = function (source, f) {
  source.modify(this, f);
  return this;
};

module.exports = transaction;
