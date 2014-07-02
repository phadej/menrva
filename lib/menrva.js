/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

/**
# menrva

[![Build Status](https://secure.travis-ci.org/ogre/menrva.svg?branch=master)](http://travis-ci.org/ogre/menrva)

Top secret

## Getting Started
Install the module with: `npm install menrva`

```js
var menrva = require('menrva');
menrva.some(); // some, as in awesome?
```

## API
*/
/// include option.js
/**
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

## Release History
*/
/// plain ../CHANGELOG.md
/**

## License

Copyright (c) 2014 Oleg Grenrus.
Licensed under the MIT license.
*/

"use strict";

var option = require("./option");

module.exports = {
  some: option.some,
  none: option.none,
};
