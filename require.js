/**
 * @fileOverview An implentation of JavaScript modules for use in an ASP or 
 *   WScript environment. This implementation is based on the one used in 
 *   Narhwal
 *
 * @see <a href="https://wiki.mozilla.org/ServerJS/Modules/SecurableModules">ServerJS/Modules/SecurableModules</a>
 * @see <a href="http://github.com/tlrobinson/narwhal/tree/master">Narwhal</a>
 * @author Nathan L Smith <nlloyds@gmail.com>
 * @date February 21, 2009
 */

/*global ActiveXObject, Response, Server, WScript, exports, require */
/*jslint evil:true */

(function () {

// Don't do anything if require is already there
if (typeof require === "function") { return; }

/** Global exports object */
if (typeof exports === "undefined") { exports = {}; }

/** A print function for use in logging */
function print() {
    var out = Array.prototype.slice.call(arguments).join(" ");
    if (typeof WScript === "object") {
        WScript.echo(out);
    } else if (Response && typeof Response.write !== "undefined") {
        Response.write(out + "<br />");
    }
}

////////////////////////////////////////////////////////////////////////////////
// Internal functions for file manipulation
////////////////////////////////////////////////////////////////////////////////

/**
 * An implentation of readFile, which opens a file from the filesystem and 
 * returns its contents as a string
 * @private
 */
function readFile(fileName) {
    var contents,
        fileSystem = new ActiveXObject("Scripting.FileSystemObject"),
        mapPath = function mapPath(path) { 
            var isASP = typeof Server === "object" && 
                typeof Server.mapPath !== "undefined";
            return isASP ? Server.mapPath(path) : path;
        };
    fileName = mapPath(fileName);

    if (fileSystem.fileExists(fileName)) {
        try { // JScript will throw an error if the file is empty
            contents = fileSystem.openTextFile(fileName).readAll();
        } catch (e) { contents = ""; }
    } else { throw new Error("File " + fileName + " does not exist"); }
    return contents;
}

function dirname(path) {
    var raw = String(path),
        match = raw.match(/^(.*)\/[^\/]+\/?$/);
    if (match && match[1]) { return match[1]; } 
    else if (raw.charAt(0) == "/") { return "/"; } 
    else { return "."; }
}

function canonicalize(path) {
    return path.replace(/[^\/]+\/\.\.\//g, "").replace(/([^\.])\.\//g, "$1").
        replace(/^\.\//g, "").replace(/\/\/+/g, "/");
}

////////////////////////////////////////////////////////////////////////////////

function _require(name, parentPath, loadOnce) {
    var result, pwd, extensions, paths, path, searchDirectory, ext;
    if (name.charAt(0) === "/") {
        result = _attemptLoad(name, name, loadOnce);
        if (result) { return result; }
    } else {
        pwd = dirname(parentPath);
        extensions = (/\.\w+$/).test(name) ? [""] : require.extensions;
        paths = ["."].concat(require.paths);
        for (var j = 0; j < extensions.length; j++) {
            ext = extensions[j];
            for (var i = 0; i < paths.length; i++) {
                searchDirectory = (paths[i] === ".") ? pwd : paths[i];
                path = searchDirectory + "/" + name + ext;
                result = _attemptLoad(name, path, loadOnce);
                if (result) { return result; }
            }
        }
    }
    throw new Error("couldn't find " + name);
}

function _requireFactory(path, loadOnce) {
    return function(name) {
        return _require(name, path, loadOnce || false);
    };
}

function _attemptLoad(name, path, loadOnce) {
    path = canonicalize(path);
    var module, moduleCode;
        
    // see if the module is already loaded
    if (require.loaded[path] && loadOnce) { return require.loaded[path]; }
    try { moduleCode = readFile(path); } catch (e) {}
    if (typeof moduleCode !== "undefined") {
        require.loaded[path] = {};
        module = new Function("require", "exports", moduleCode);
        module(_requireFactory(path, true), require.loaded[path]);
        return require.loaded[path];
    }
    return false;
}

/** The global require function */
require = function (name) { return _require(name, ".", true); };

require.paths = ["lib"];
require.loaded = {};
require.extensions = [".js"];
 
})();
