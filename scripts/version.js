"use strict";

var fs = require("fs");
var jsstana = require("jsstana");
var esprima = require("esprima");
var estraverse = require("estraverse");

var pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());
var version = pkg.version;

console.log("package.json version:", version);

var filename = __dirname + "/../src/menrva.js";
var contents = fs.readFileSync(filename).toString();
var syntax = esprima.parse(contents, { loc: true, range: true });

var versionLocation;

estraverse.traverse(syntax, {
  enter: function (node) {
    var m = jsstana.match("(var version (?value string))", node);
    if (m) {
      versionLocation = m.value.range;
    }
  },
});

if (versionLocation) {
  contents = contents.substr(0, versionLocation[0]) + "\"" + version + "\"" + contents.substr(versionLocation[1]);

  fs.writeFileSync(filename, contents);
}
