/*
 * menrva
 * https://github.com/phadej/menrva
 *
 * Copyright (c) 2014 Oleg Grenrus
 * Licensed under the MIT license.
 */

"use strict";

/**
	### Equalities

	#### egal

	> egal (a, b) : boolean

	Identity check. `Object.is`. http://wiki.ecmascript.org/doku.php?id=harmony:egal
*/
function egal(a, b) {
	if (a === 0 && b === 0) {
		return 1/a === 1/b;
	} else if (a !== a) {
		return b !== b;
	} else {
		return a === b;
	}
}

module.exports = egal;
