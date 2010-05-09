// CommonJScript for ASP

/*global require, exports, ActiveXObject, Response, Server */
/*jslint evil:true */

(function () {

// Base setup
// =============================================================================
var modules = {}, paths = [], print, global;

// Don't do anything if require is already there
if (typeof require === "function") { return; }

// ASP Only
if (typeof Server === "undefined" || typeof Response === "undefined") {
    throw Error("This script only runs in ASP.");
}

// Stand-in for require
require = function (id) { return modules[id]; }; // global

// JScript does not support assigning properties explicitly on the global
// object or a reference to it. Some included modules try to modify this, so
// use an empty object in its place.
global = {};

// Engine
// =============================================================================
(function (exports) {

exports.engine = "jscript";
exports.debug = require.debug;

// We're treating paths on ASP like Unix paths, so misreport the os.
// Hey, IE's been calling itself Mozilla all these years, so this is nothing.
exports.os = "asp";

exports.Module = function (text, path, line) {
    // Return a function that takes an object, which returns another function
    // that takes the inject properties
    return function (inject) {
        inject = inject || {};
        var names = [], values = [], result, ee;

        for (var name in inject) {
            if (Object.prototype.hasOwnProperty.call(inject, name)) {
                names.push(name);
                values.push(inject[name]);
            }
        }

        // JScript's eval is not ES3 compliant, so the function needs to be
        // assigned to a variable.
        // @see http://www.bigresource.com/ASP-JScript-eval-bug-6nZST3Bk.html
        eval("result = function (" + names.join(", ") + ") { " + text + "};");

        try {
            return result.apply(null, values);
        } catch (e) {
            // rethrow error with path
            ee = new Error(e.number, e.description + " (in " + path + ")");
            ee.name = e.name;
            ee.message = e.message;
            throw ee;
        }
    }
};

})(modules.engine = {});

// System
// =============================================================================
(function (exports) {

exports.platform = "asp";

exports.stdout = {
    print: function () {
        Response.write(Array.prototype.slice.call(arguments).join(" ") +
            "<br />");
    }
};

// system.stdio.print is not defined in any specs, but the Modules/1.0 test
// suite uses it
exports.stdio = { print: exports.stdout.print };

exports.print = exports.stdout.print;

// TODO
exports.env = {};

})(modules.system = {});

print = require("system").print; // Add print function here

// File
//
// From narwhal-lib/lib/narwhal/fs-boot.js
// =============================================================================
(function (exports) {
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson TODO

/**
 * Pure JavaScript implementations of file system path
 * manipulation.
 *
 * This module depends on the non CommonJS "engine" module,
 * particularly for an "os" property that has the words
 * "windows" or "winnt" to distinguish Windows from Unix
 * file systems.
 */

// NOTE: this file may be used is the engine bootstrapping
// process, so any "requires" must be accounted for in
// narwhal.js

/*whatsupdoc*/
/*markup markdown*/

var ENGINE = require("engine");

/**
 * @name ROOT
 * * `/` on Unix
 * * `\` on Windows
 */

/**
 * @name SEPARATOR
 * * `/` on Unix
 * * `\` on Windows
 */

/**
 * @name ALT_SEPARATOR
 * * undefined on Unix
 * * `/` on Windows
 */

if (/\bwind(nt|ows)\b/i.test(ENGINE.os)) {
    exports.ROOT = "\\";
    exports.SEPARATOR = "\\";
    exports.ALT_SEPARATOR = "/";
} else {
    exports.ROOT = "/";
    exports.SEPARATOR = "/";
    exports.ALT_SEPARATOR = undefined;
}

// we need to make sure the separator regex is always in sync with the separators.
// this caches the generated regex and rebuild if either separator changes.
var separatorCached, altSeparatorCached, separatorReCached;
/**
 * @function
 */
exports.SEPARATORS_RE = function () {
    if (
        separatorCached !== exports.SEPARATOR ||
        altSeparatorCached !== exports.ALT_SEPARATOR
    ) {
        separatorCached = exports.SEPARATOR;
        altSeparatorCached = exports.ALT_SEPARATOR;
        separatorReCached = new RegExp("[" +
            (separatorCached || '').replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&") +
            (altSeparatorCached || '').replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&") +
        "]", "g");
    }
    return separatorReCached;
}

/**
 * separates a path into components.  If the path is
 * absolute, the first path component is the root of the
 * file system, indicated by an empty string on Unix, and a
 * drive letter followed by a colon on Windows.
 * @returns {Array * String}
 */
exports.split = function (path) {
    var parts;
    try {
        parts = String(path).split(exports.SEPARATORS_RE());
    } catch (exception) {
        throw new Error("Cannot split " + (typeof path) + ', "' + path + '"');
    }
    // this special case helps isAbsolute
    // distinguish an empty path from an absolute path
    // "" -> [] NOT [""]
    if (parts.length == 1 && parts[0] == "")
        return [];
    // "a" -> ["a"]
    // "/a" -> ["", "a"]
    return parts;
};

/**
 * Takes file system paths as variadic arguments and treats
 * each as a file or directory path and returns the path
 * arrived by traversing into the those paths.  All
 * arguments except for the last must be paths to
 * directories for the result to be meaningful.
 * @returns {String} path
 */
exports.join = function () {
    if (arguments.length === 1 && typeof arguments[0] === "object")
        return exports.normal.apply(exports, arguments[0]);
    return exports.normal.apply(exports, arguments);
};

/**
 * Takes file system paths as variadic arguments and treats
 * each path as a location, in the URL sense, resolving each
 * new location based on the previous.  For example, if the
 * first argument is the absolute path of a JSON file, and
 * the second argument is a path mentioned in that JSON
 * file, `resolve` returns the absolute path of the
 * mentioned file.
 * @returns {String} path
 */
exports.resolve = function () {
    var root = "";
    var parents = [];
    var children = [];
    var leaf = "";
    for (var i = 0; i < arguments.length; i++) {
        var path = String(arguments[i]);
        if (path == "")
            continue;
        var parts = path.split(exports.SEPARATORS_RE());
        if (exports.isAbsolute(path)) {
            root = parts.shift() + exports.SEPARATOR;
            parents = [];
            children = [];
        }
        leaf = parts.pop();
        if (leaf == "." || leaf == "..") {
            parts.push(leaf);
            leaf = "";
        }
        for (var j = 0; j < parts.length; j++) {
            var part = parts[j];
            if (part == "." || part == '') {
            } else if (part == "..") {
                if (children.length) {
                    children.pop();
                } else {
                    if (root) {
                    } else {
                        parents.push("..");
                    }
                }
            } else {
                children.push(part);
            }
        };
    }
    path = parents.concat(children).join(exports.SEPARATOR);
    if (path) leaf = exports.SEPARATOR + leaf;
    return root + path + leaf;
};

/**
 * Takes paths as any number of arguments and reduces them
 * into a single path in normal form, removing all "." path
 * components, and reducing ".." path components by removing
 * the previous path component if possible.
 * @returns {String} path
 */
exports.normal = function () {
    var root = "";
    var parents = [];
    var children = [];
    for (var i = 0, ii = arguments.length; i < ii; i++) {
        var path = String(arguments[i]);
        // empty paths have no affect
        if (path === "")
            continue;
        var parts = path.split(exports.SEPARATORS_RE());
        if (exports.isAbsolute(path)) {
            root = parts.shift() + exports.SEPARATOR;
            parents = [];
            children = [];
        }
        for (var j = 0, jj = parts.length; j < jj; j++) {
            var part = parts[j];
            if (part == "." || part == '') {
            } else if (part == "..") {
                if (children.length) {
                    children.pop();
                } else {
                    if (root) {
                    } else {
                        parents.push("..");
                    }
                }
            } else {
                children.push(part);
            }
        }
    }
    path = parents.concat(children).join(exports.SEPARATOR);
    return root + path;
};

/***
 * @returns {Boolean} whether the given path begins at the
 * root of the file system or a drive letter.
 */
exports.isAbsolute = function (path) {
    // for absolute paths on any operating system,
    // the first path component always determines
    // whether it is relative or absolute.  On Unix,
    // it is empty, so ['', 'foo'].join('/') == '/foo',
    // '/foo'.split('/') == ['', 'foo'].
    var parts = exports.split(path);
    // split('') == [].  '' is not absolute.
    // split('/') == ['', ''] is absolute.
    // split(?) == [''] does not occur.
    if (parts.length == 0)
        return false;
    return exports.isRoot(parts[0]);
};

/**
 * @returns {Boolean} whether the given path does not begin
 * at the root of the file system or a drive letter.
 */
exports.isRelative = function (path) {
    return !exports.isAbsolute(path);
};

/**
 * @returns {Boolean} whether the given path component
 * corresponds to the root of the file system or a drive
 * letter, as applicable.
 */
exports.isRoot = function (first) {
    if (/\bwind(nt|ows)\b/i.test(ENGINE.os)) {
        return /:$/.test(first);
    } else {
        return first == "";
    }
};

/**
 * @returns {String} the Unix root path or corresponding
 * Windows drive for a given path.
 */
exports.root = function (path) {
    if (!exports.isAbsolute(path))
        path = require("./fs").absolute(path);
    var parts = exports.split(path);
    return exports.join(parts[0], '');
};

/**
 * @returns {String} the parent directory of the given path.
 */
exports.directory = function (path) {
    var parts = exports.split(path);
    // XXX needs to be sensitive to the root for
    // Windows compatibility
    parts.pop();
    return parts.join(exports.SEPARATOR) || ".";
};

/**
 * @returns {String} the last component of a path, without
 * the given extension if the extension is provided and
 * matches the given file.
 * @param {String} path
 * @param {String} extention an optional extention to detect
 * and remove if it exists.
 */
exports.base = function (path, extension) {
    var base = path.split(exports.SEPARATORS_RE()).pop();
    if (extension)
        base = base.replace(
            new RegExp(RegExp.escape(extension) + '$'),
            ''
        );
    return base;
};

/**
 * @returns {String} the extension (e.g., `txt`) of the file
 * at the given path.
 */
exports.extension = function (path) {
    path = exports.base(path);
    path = path.replace(/^\.*/, '');
    var index = path.lastIndexOf(".");
    return index <= 0 ? "" : path.substring(index);
};
})(modules["narwhal/fs"] = {});

// File - platform specific
// =============================================================================
(function (exports) {

var fso = new ActiveXObject("Scripting.FileSystemObject"),
    stream = new ActiveXObject("ADODB.Stream");

// Wrap some calls in Server.mapPath on ASP
function m(path) { return Server.mapPath(path) }

exports.isFile = function (path) {
    return fso.fileExists(m(path));
};

exports.read = function (path, options) {
    var charset = (options || {}).charset || "utf-8",
        adTypeText = 2, text = "";

    stream.open();
        stream.charset = charset;
        stream.type = adTypeText;
        stream.loadFromFile(m(path));
        text = stream.readText();
    stream.close();

    return text;
};
})(modules.file = modules["narwhal/fs"]);

// Loader
//
// from narwhal-lib/lib/narwhal/loader.js
// =============================================================================
(function (exports) {
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- cadorn Christoph Dorn

// NOTE: when this file is being loaded as part of the
// Narwhal bootstrapping process, all of the "requires" that
// occur here have to be manually accounted for (who loads
// the loader?)

var ENGINE = require("engine");
// HACK: the stars prevent the file module from being sent to browser
//  clients with the regexen we're using.  we need a real solution
//  for this.
var FS = require(/**/"narwhal/fs"/**/);

// this gets swapped out with a full fledged-read before
//  we're done using it
var read = FS.read;

exports.Loader = function (options) {
    var loader = {};
    var factories = options.factories || {};
    var paths = options.paths;
    var extensions = options.extensions || ["", ".js"];
    var timestamps = {};
    var debug = options.debug;

    loader.resolve = exports.resolve;

    loader.resolvePkg = function(id, baseId, pkg, basePkg) {
        return exports.resolvePkg(loader, id, baseId, pkg, basePkg);
    };

    loader.find = function (topId) {
        // if it's absolute only search the "root" directory.
        // FS.join() must collapse multiple "/" into a single "/"
        var searchPaths = FS.isAbsolute(topId) ? [""] : paths;

        for (var j = 0; j < extensions.length; j++) {
            var extension = extensions[j];
            for (var i = 0; i < searchPaths.length; i++) {
                var path = FS.join(searchPaths[i], topId + extension);
                if (FS.isFile(path))
                    return path;
            }
        }
        throw new Error("require error: couldn't find \"" + topId + '"');
    };

    loader.fetch = function (topId, path) {
        if (!path)
            path = loader.find(topId);
        if (typeof FS.lastModified === "function")
            timestamps[path] = FS.lastModified(path);
        if (debug)
            print('loader: fetching ' + topId);
        var text = read(path, {
            'charset': 'utf-8'
        });
        // we leave the endline so the error line numbers align
        text = text.replace(/^#[^\n]+\n/, "\n");
        return text;
    };

    loader.Module = function (text, topId, path) {
        if (ENGINE.Module) {
            if (!path)
                path = loader.find(topId);
            var factory = ENGINE.Module(text, path, 1);
            factory.path = path;
            return factory;
        } else {
            return function (inject) {
                var keys = [], values = [];
                for (var key in inject) {
                    if (Object.prototype.hasOwnProperty.call(inject, key)) {
                        keys.push(key);
                        values.push(inject[key]);
                    }
                }
                return Function.apply(null, keys).apply(this, values);
            };
        }
    };

    loader.load = function (topId, path) {
        if (!Object.prototype.hasOwnProperty.call(factories, topId)) {
            loader.reload(topId, path);
        } else if (typeof FS.lastModified === "function") {
            var path = loader.find(topId);
            if (loader.hasChanged(topId, path))
                loader.reload(topId, path);
        }
        return factories[topId];
    };

    loader.reload = function (topId, path) {
        factories[topId] = loader.Module(loader.fetch(topId, path), topId, path);
    };

    loader.isLoaded = function (topId) {
        return Object.prototype.hasOwnProperty.call(factories, topId);
    };

    loader.hasChanged = function (topId, path) {
        if (!path)
            path = loader.resolve(topId);
        return (
            !Object.prototype.hasOwnProperty.call(timestamps, path) ||
            FS.lastModified(path) > timestamps[path]
        );
    };

    loader.paths = paths;
    loader.extensions = extensions;

    return loader;
};

exports.resolve = function (id, baseId) {
    id = String(id);
    if (id.charAt(0) == ".") {
        id = FS.directory(baseId) + "/" + id;
    }
    // module ids need to use forward slashes, despite what the OS might say
    return FS.normal(id).replace(/\\/g, '/');
};

exports.resolvePkg = function(loader, id, baseId, pkg, basePkg) {
    if(!loader.usingCatalog) {
        // no usingCatalog - fall back to default
        return [exports.resolve(id, baseId), null];
    }
    if(pkg) {
        // locate id in pkg
        if(basePkg && loader.usingCatalog[basePkg]) {
            // see if pkg is an alias                
            var packages = loader.usingCatalog[basePkg].packages;
            if(packages[pkg]) {
                if(loader.usingCatalog[packages[pkg]]) {
                    var path = loader.usingCatalog[packages[pkg]].libPath;
                    return [exports.resolve("./" + id, path + "/"), packages[pkg]];
                } else {
                    throw "Package '"+packages[pkg]+"' aliased with '"+pkg+"' in '"+basePkg+"' not found";
                }
            }
        }
        // see if pkg is a top-level ID             
        if(loader.usingCatalog[pkg]) {
            var path = loader.usingCatalog[pkg].libPath;
            return [exports.resolve("./" + id, path + "/"), pkg];
        } else {
            throw "Package '" + pkg + "' not aliased in '"+basePkg+"' nor a top-level ID";
        }
    } else {
        // if id is relative we want a module relative to basePkg if it exists
        if(id.charAt(0) == "." && basePkg) {
            // if baseId is absolute we use it as a base and ignore basePkg
            if (FS.isAbsolute(baseId)) {
                path = FS.Path(baseId);
            } else if (loader.usingCatalog[basePkg]) {
                path = loader.usingCatalog[basePkg].libPath.join(baseId);
            } else {
                throw "basePkg '" + basePkg + "' not known";
            }
            
            // try and locate the path - at this stage it should be found
            return [exports.resolve(id, path.valueOf()), basePkg];
            
        } else {
            // id is not relative - resolve against system modules
            return [exports.resolve(id, baseId), undefined];
        }
    }
};
})(modules.loader = {});

// Sandbox
//
// from narwhal-lib/lib/narwhal/sandbox.js
// =============================================================================
(function (exports) {
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License

// NOTE: this file is used is the bootstrapping process,
// so any "requires" must be accounted for in narwhal.js

var SYSTEM = require("system");
var ENGINE = require("engine");

exports.Sandbox = function (options) {
    options = options || {};
    var loader = options.loader;
    var exportsMemo = options.modules || {};
    var moduleMemo = {};
    var debug = options.debug !== undefined ? !!options.debug : !!ENGINE.debug;
    var debugDepth = 0;
    var main;
    var setDisplayName = (ENGINE.engine == "jsc");

    // managed print free variable in the sandbox forwards
    // to system.print in the sandbox
    var subprint = options.print || function () {
        var subsystem = sandbox("system");
        return subsystem.print.apply(subsystem, arguments);
    };

    var sandbox = function (id, baseId, pkg, basePkg, options) {

        if (!options)
            options = {};

        if (sandbox.debug)
            SYSTEM.print("REQUIRE: id["+id+"] baseId["+baseId+"] pkg["+pkg+"] basePkg["+basePkg+"]");

        if (loader.resolvePkg) {
            var resolveInfo = loader.resolvePkg(id, baseId, pkg, basePkg);
            id = resolveInfo[0];
            pkg = resolveInfo[1];
        } else {
            id = loader.resolve(id, baseId);
        }

        if (sandbox.debug)
            SYSTEM.print("USING: id["+id+"] pkg["+pkg+"]");

        /* populate memo with module instance */
        if (!Object.prototype.hasOwnProperty.call(exportsMemo, id) || options.force || options.once) {

            if (sandbox.debug)
                SYSTEM.print(new Array(++debugDepth + 1).join("\\") + " " + id, 'module');

            var globals = {};
            if (sandbox.debug) {
                // record globals
                for (var name in global)
                    globals[name] = true;
            }

            var exports;
            if (options.once) {
                exports = {};
            } else {
                if (!Object.prototype.hasOwnProperty.call(exportsMemo, id) || options.reload)
                    exports = exportsMemo[id] = {};
                exports = exportsMemo[id];
            }

            if (options.reload)
                loader.reload(id);

            var factory;
            try {
                factory = loader.load(id);
            } finally {
                // poor man's catch and rethrow (Rhino sets file/line to where the exception is thrown, not created)
                if (!factory) {
                    delete exportsMemo[id];
                    if (sandbox.debug)
                        debugDepth--;
                }
            }

            var require = Require(id, pkg);
            var load = Load(id, pkg);
            var module
                = moduleMemo[id]
                = moduleMemo[id] || Module(id, factory.path);
            if (pkg) {
                module["package"] = pkg;
                module.using = (
                    pkg && loader.usingCatalog && loader.usingCatalog[pkg] ?
                    loader.usingCatalog[pkg]["packages"] :
                    {}
                );
            }

            var scope = {
                "require": require,
                "exports": exports,
                "module": module,
                "print": subprint
            };

            // require.once provides a scope of extra stuff to inject
            if (options.scope) {
                for (var name in options.scope) {
                    if (Object.prototype.hasOwnProperty.call(options.scope, name)) {
                        scope[name] = options.scope[name];
                    }
                }
            }

            var completed;
            try {
                factory(scope);
                completed = true;
            } finally {
                if (!completed) {
                    delete exportsMemo[id];
                    delete moduleMemo[id];
                }
            }

            if (sandbox.debug) {
                // check for new globals
                for (var name in global)
                    if (!globals[name])
                        SYSTEM.print("NEW GLOBAL: " + name);
            }

            if (sandbox.debug)
                SYSTEM.print(new Array(debugDepth-- + 1).join("/") + " " + id, 'module');

            // set fn.displayName on exported functions for better debugging
            if (setDisplayName) {
                var displayID = id.replace(/[^\w]/g, "_").toUpperCase();
                for (var name in exports) {
                    if (typeof exports[name] === "function" && !exports[name].displayName &&
                            Object.prototype.hasOwnProperty.call(exports, name)) {
                        exports[name].displayName = displayID+"."+name;
                    }
                }
            }

        } else {
            if (sandbox.debug > 1)
                SYSTEM.print(new Array(debugDepth + 1).join("|") + " " + id, 'module');
            exports = exportsMemo[id];
            if (moduleMemo[id]) {
                moduleMemo[id].setExports = function () {
                    throw new Error("Cannot set exports after a module has been required by another module.");
                };
            }
        }

        /* support curryId for modules in which it is requested */
        var imports = {};
        var importsUsed = false;
        var curryUsed = false;
        for (var name in exports) {
            curryUsed = (
                typeof exports[name] == "function" &&
                // if it is Java class this will throw an exception, which is terribly annoying during debugging
                Object.prototype.toString.call(exports[name]) !== "[object JavaClass]" &&
                exports[name].xNarwhalCurry
            );

            if (curryUsed) {
                importsUsed = true;
                imports[name] = (function (block, module) {
                    return function () {
                        return block.apply(
                            this,
                            [module].concat(Array.prototype.slice.call(arguments))
                        );
                    };
                })(exports[name], moduleMemo[baseId]);
            } else {
                imports[name] = exports[name];
            }
        }

        if (!importsUsed)
            imports = exports;

        return imports;

    };

    /*
    sandbox.async = function (id, baseId, pkg, basePkg, options) {
    };
    */

    sandbox.load = function (id, baseId, pkg, basePkg) {
        if (loader.resolvePkg) {
            var resolveInfo = loader.resolvePkg(id, baseId, pkg, basePkg);
            id = resolveInfo[0];
            pkg = resolveInfo[1];
        } else {
            id = loader.resolve(id, baseId);
        }
        return loader.load(id);
    };

    sandbox.once = function (id, baseId, pkg, basePkg, scope) {
        return sandbox(id, baseId, pkg, basePkg, {"scope": scope});
    };

    /*
    sandbox.load.async = function (id, baseId, pkg, basePkg, options) {
    };
    */

    sandbox.force = function (id) {
        /*                 baseId,    pkgId,     basePkg  , options */
        return sandbox(id, undefined, undefined, undefined, {"force": true});
    };

    sandbox.main = function (id, path) {
        if (!path && sandbox.loader.find)
            path = sandbox.loader.find(id)[1];
        id = sandbox.loader.resolve(id, "");
        main = sandbox.main = moduleMemo[id] = moduleMemo[id] || Module(id, path);
        sandbox(id);
        return main;
    };

    sandbox.loader = loader;
    sandbox.system = SYSTEM;
    sandbox.paths = loader.paths;
    sandbox.extensions = loader.extensions;
    sandbox.debug = debug;

    var Require = function (baseId, basePkg) {
        // variations of require.* functions that close on a
        // particular [package/]module
        var require = function (id, pkg) {
            return sandbox(id, baseId, pkg, basePkg);
        };
        require.async = function (id, pkg) {
            return sandbox.async(id, baseId, pkg, basePkg);
        };
        require.once = function (id, scope) {
            return sandbox.once(id, baseId, undefined, undefined, scope);
        };
        require.once.async = function (id, scope) {
            return sandbox.once.async(id, baseId, undefined, undefined, scope);
        };
        require.load = function (id, pkg) {
            return sandbox.load(id, baseId, pkg, basePkg);
        };
        require.load.async = function (id, pkg) {
            return sandbox.load.async(id, baseId, pkg, basePkg);
        };
        require.force = function (id) {
            return sandbox.force(id, baseId);
        };
        require.loader = loader;
        require.main = main;
        require.paths = loader.paths;
        require.extensions = loader.extensions;
        return require;
    };

    var Load = function (baseId, basePkg) {
        var load = function (id, pkg) {
            return sandbox.load(id, baseId, pkg, basePkg);
        };
        load.async = function (id) {
            return sandbox.load.async(id, baseId, pkg, basePkg);
        };
        return load;
    };

    var Module = function (baseId, path) {
        var module = {};
        module.id = baseId;
        module.path = path;
        module.xNarwhalCurry = function (block) {
            block.xNarwhalCurry = true;
            return block;
        };
        module.setExports = function (exports) {
            return exportsMemo[baseId] = exports;
        };
        return module;
    };

    return sandbox;
};

exports.sandbox = function(main, system, options) {
    options = options || {};
    var prefix = options['prefix'];
    var loader = options['loader'] || require.loader;
    var modules = options['modules'] || {};
    var print = options['print'];
    var debug = options['debug'];
    if (!loader) throw new Error(
        "sandbox cannot operate without a loader, either explicitly " +
        "provided as an option, or implicitly provided by the current " +
        "sandbox's 'loader' object."
    );
    if (prefix)
        loader = require("narwhal/loader/prefix").PrefixLoader(prefix, loader);
    var sandbox = exports.Sandbox({
        modules: modules,
        loader: loader,
        print: print,
        debug: debug
    });

    return sandbox.main(main);
};
})(modules.sandbox = {});

// =============================================================================

// Set up paths
paths = ["", "lib", "engines/" + require("engine").engine + "/lib",
         "engines/" + require("system").platform + "/lib"];

// Create require
require = require("sandbox").Sandbox({
    loader: require("loader").Loader({ paths: paths, debug: require.debug }),
    modules: modules,
    debug: require.debug
});

})(this);
