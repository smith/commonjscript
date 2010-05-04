// commonjscript require

/*global require, exports, ActiveXObject, Response, Server, WScript */
/*jslint evil:true */

// Globals

(function () {

var modules = {}, paths = [];

// Base setup
// =============================================================================

// Don't do anything if require is already there
if (typeof require === "function") { return; }

// Global exports object
if (typeof exports === "undefined") { exports = {}; }

// Stand-in for require
require = function (id) { return modules[id]; };

// System
// =============================================================================
modules.system = (function (exports) {

var platform;

exports.engine = "jscript";
exports.os = "windows";

// WScript or ASP?
if (typeof Response === "object" && typeof Response.write !== "undefined") {
    platform = "asp";
} else if (typeof WScript === "object") { platform = "wscript";
} else { platform = "unknown"; }
exports.platform = platform;

// print function
exports.print = function () {
    var out = Array.prototype.slice.call(arguments).join(" ");
    if (platform === "wscript") { WScript.echo(out); }
    else if (platform === "asp") { Response.write(out + "<br />"); }
};

return exports;
})({});

// File
// =============================================================================
modules.file = (function (exports) {

return exports;
})({});

// Loader
// =============================================================================

function Loader() {

}

// Sandbox
// =============================================================================

function Sandbox() {
    return require;
}

// =============================================================================
require = Sandbox({ loader: Loader({ paths: paths }) });

})(this);
