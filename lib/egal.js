/**
	### Equalities

	#### egal (a, b) : boolean

	http://wiki.ecmascript.org/doku.php?id=harmony:egal
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
