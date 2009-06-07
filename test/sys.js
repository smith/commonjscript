// print function
exports.print = function () {
    var out = Array.prototype.slice.call(arguments).join(" ");
    if (typeof WScript === "object") {
        WScript.echo(out);
    } else if (typeof Response === "object" && 
               typeof Response.write !== "undefined") {
        Response.write(out + "<br />");
    }
};

