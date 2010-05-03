// commonjscript system module

/*global Response, WScript */

var platform;

exports.engine = "jscript";

// The platform is either wscript (cli) or asp
if (typeof WScript === "object") {
    platform = "wscript";
} else if (typeof Response === "object" &&
         typeof Response.write !== "undefined") {
    platform = "asp";
} else {
    platform = "unknown";
}

// print function
exports.print = function () {
    var out = Array.prototype.slice.call(arguments).join(" ");
    if (platform === "wscript") { WScript.echo(out); }
    else if (platform === "asp") { Response.write(out + "<br />"); }
};

exports.stdio = { print: exports.print };
