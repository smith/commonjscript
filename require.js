// commonjscript require

/*global ActiveXObject, Response, Server, WScript */
/*jslint evil:true */

(function (global) {

var platform, fs = {}, paths = [];

// Base setup
// =============================================================================

// Don't do anything if require is already there
if (typeof global.require === "function") { return; }

// Global exports object
if (typeof global.exports === "undefined") { global.exports = {}; }

// WScript or ASP?
if (typeof Response === "object" && typeof Response.write !== "undefined") {
    platform = "asp";
} else if (typeof WScript === "object") { platform = "wscript";
} else { platform = "unknown"; }

// alias for Server.mapPath on ASP
function m(path) { return platform === "asp" ? Server.mapPath(path) : path; }

// print function
function print() {
    var out = Array.prototype.slice.call(arguments).join(" ");
    if (platform === "wscript") { WScript.echo(out); }
    else if (platform === "asp") { Response.write(out + "<br />"); }
}

// Filesystem
// =============================================================================

fs = {
    // Filesystem object
    o: new ActiveXObject("Scripting.FileSystemObject")

};

// Loader
// =============================================================================

function Loader() {

}

// Sandbox
// =============================================================================

function Sandbox() {
    return function () {};
}

// ============================================================================
global.require = Sandbox({ loader: Loader({ paths: paths }) });

})(this);
