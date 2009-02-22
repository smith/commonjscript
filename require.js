/**
 * @fileOverview An implentation of JavaScript modules for use in an ASP
 *  environment. This implentation is based on the one used in Jack
 *
 * @see <a href="https://wiki.mozilla.org/ServerJS/Modules/SecurableModules">ServerJS/Modules/SecurableModules</a>
 * @see <a href="http://jackjs.org/">Jack</a>
 * @author Nathan L Smith <nlloyds@gmail.com>
 * @date February 21, 2009
 */

(function () {

// Don't do anything if require is already there
if (typeof require === "function") { return; }

/** 
 * @namespace The global environment object is used by the interoperablejs 
 * test suite for native platform functions
 */
environment = {
    print : function print() {
        Response.write(Array.prototype.slice.call(arguments).join(" ") + 
            "<br />");
    }    
};
var print = environment.print;
 
/**
 * Global exports object
 */
exports = {};

// Debug mode
var debug = false;

// logger shim
var log = {};
log.fatal = log.error = log.warn = log.info = log.debug = function() {
    print(Array.prototype.join.apply(arguments, [" "]));
};
if (!debug) { log.debug = function () {} }

/**
 * An implenation of readFile, which opens a file from the filesystem and 
 * returns its contents as a string
 * @private
 */
function readFile(fileName) {
    var contents = "";
    var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
    var mapPath = function mapPath(path) { 
        return Server.mapPath(path);
    };
    fileName = mapPath(fileName);
    var file = fileSystem.getFile(fileName);
    if (file.size > 0) {
        contents = fileSystem.openTextFile(fileName).readAll();
    }
    return contents;
}

require = function (name) {
    return _require(name, ".", true);
}

require.paths = (typeof $LOAD_PATH === "string") ? $LOAD_PATH.split(":") : ["lib"];
require.loaded = {};
require.extensions = [".js"];
 
function _require(name, parentPath, loadOnce) {
    log.debug(" + _require: " + name + " (parent="+parentPath+", loadOnce="+loadOnce+")");
    if (name.charAt(0) === "/") {
        var result = _attemptLoad(name, name, loadOnce);
        if (result) { return result; }
    }
    else
    {
        var pwd = dirname(parentPath),
            extensions = (/\.\w+$/).test(name) ? [""] : require.extensions,
            paths = ["."].concat(require.paths);
        for (var j = 0; j < extensions.length; j++) {
            var ext = extensions[j];
            for (var i = 0; i < paths.length; i++) {
                var searchDirectory = (paths[i] === ".") ? pwd : paths[i],
                    path = searchDirectory + "/" + name + ext;
                var result = _attemptLoad(name, path, loadOnce);
                if (result) { return result; }
            }
        }
    }
    
    log.debug("couldn't find " + name);
    
    throw new Error("couldn't find " + name); // make this the default behavior pending Securable Modules decision
    
    return undefined;
}
 
function _requireFactory(path, loadOnce) {
    return function(name) {
        return _require(name, path, loadOnce || false);
    }
}
 
function _attemptLoad(name, path, loadOnce) {
    var path = canonicalize(path),
        moduleCode;
        
    // see if the module is already loaded
    if (require.loaded[path] && loadOnce) { return require.loaded[path]; }
    try { moduleCode = readFile(path); } catch (e) {}
    
    if (moduleCode) {
        log.debug(" + loading: " + path + " (" + name + ")");
        
        require.loaded[path] = {};
        
        var module;
        module = new Function("require", "exports", moduleCode)
        
        module(_requireFactory(path, true), require.loaded[path]);

        return require.loaded[path];
    }
    return false;
}
 
////////////////////////////////////////////////
// Ugh, these are duplicated from the File object, since they're required for
// require, which is required for loading the File object.
var dirname = function(path) {
    var raw = String(path),
        match = raw.match(/^(.*)\/[^\/]+\/?$/);
    if (match && match[1])
        return match[1]
    else if (raw.charAt(0) == "/")
        return "/"
    else
        return "."
}
var canonicalize = function(path) {
    return path.replace(/[^\/]+\/\.\.\//g, "").replace(/([^\.])\.\//g, "$1").replace(/^\.\//g, "").replace(/\/\/+/g, "/");
}
////////////////////////////////////////////////
})();
