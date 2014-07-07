/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

/**
# menrva

<!-- README.md is autogenerated -->

[![Build Status](https://secure.travis-ci.org/phadej/menrva.svg?branch=master)](http://travis-ci.org/phadej/menrva)
[![NPM version](http://img.shields.io/npm/v/menrva.svg)](https://www.npmjs.org/package/menrva)
[![Dependency Status](https://david-dm.org/phadej/menrva.svg)](https://david-dm.org/phadej/menrva)
[![devDependency Status](https://david-dm.org/phadej/menrva/dev-status.svg)](https://david-dm.org/phadej/menrva#info=devDependencies)
[![Coverage Status](https://img.shields.io/coveralls/phadej/menrva.svg)](https://coveralls.io/r/phadej/menrva?branch=master)
[![Code Climate](http://img.shields.io/codeclimate/github/phadej/menrva.svg)](https://codeclimate.com/github/phadej/menrva)

Ambitious data-flow library.

## Getting Started
Install the module with: `npm install menrva`

```js
var menrva = require('menrva');
menrva.some('awe'); // some, as in awesome?
```

## API
*/
/// include signal.js
/// include transaction.js
/// include egal.js
/// include option.js
/**
## Contributing
*/
/// plain ../CONTRIBUTING.md
/**
## Release History
*/
/// plain ../CHANGELOG.md
/**

## License

Copyright (c) 2014 Oleg Grenrus.
Licensed under the MIT license.
*/

"use strict";

var egal = require("./egal.js");
var option = require("./option.js");
var signal = require("./signal.js");
var transaction = require("./transaction.js");

var version = "0.0.4";

module.exports = {
  egal: egal,
  some: option.some,
  none: option.none,
  Signal: signal.Signal,
  source: signal.source,
  combine: signal.combine,
  transaction: transaction,
  version: version,
};
