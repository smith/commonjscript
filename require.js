// commonjscript require

/*global require, exports, ActiveXObject, Response, Server, WScript */
/*jslint evil:true */

(function (global) {

// Base setup
// =============================================================================
var modules = {}, paths = [], print;

// Don't do anything if require is already there
if (typeof require === "function") { return; }

// Stand-in for require
require = function (id) { return modules[id]; };

// System
// =============================================================================
(function (exports) {

var platform;

exports.engine = "jscript";
exports.os = "windows";
exports.debug = require.debug;

// WScript or ASP?
if (typeof Response === "object" && typeof Response.write !== "undefined") {
    platform = "asp";
} else if (typeof WScript === "object") { platform = "wscript";
} else { platform = "unknown"; }
exports.platform = platform;

exports.print = function () {
    var out = Array.prototype.slice.call(arguments).join(" ");
    if (platform === "wscript") { WScript.echo(out); }
    else if (platform === "asp") { Response.write(out + "<br />"); }
};

exports.evaluate = function (text) {
    // JScript's eval is not ES3 compliant, so the function needs to be
    // assigned to a variable.
    // @see http://www.bigresource.com/ASP-JScript-eval-bug-6nZST3Bk.html
    var result;
    eval("result = function (require, exports, module) {" + text + "/**/\n};");
    return result;
};

})(modules.system = {});

print = require("system").print; // Add print function here

// File
// =============================================================================
(function (exports) {

var fso = new ActiveXObject("Scripting.FileSystemObject"),
    stream = new ActiveXObject("ADODB.Stream");

// FIXME
exports.dirname = function (path) {
    //return fso.getFile(path).path;
    return path;
};

// For Windows API functions that manipulate files, file names can often be
// relative to the current directory, while some APIs require a fully qualified
// path. A file name is relative to the current directory if it does not begin
// with one of the following:
//
//  * A UNC name of any format, which always start with two backslash characters
//  ("\\"). For more information, see the next section.
//  * A disk designator with a backslash, for example "C:\" or "d:\".
//  * A single backslash, for example, "\directory" or "\file.txt". This is also
//  referred to as an absolute path.
//
// @see http://stackoverflow.com/questions/2406739/how-to-find-whether-a-given-path-is-absolute-relative-and-convert-it-to-absolute
// @see http://msdn.microsoft.com/en-us/library/aa365247.aspx#fully_qualified_vs._relative_paths
exports.isAbsolute = function (path) {
    return (/^(?:[A-Za-z]:)?\\/).test(path);
};

exports.isFile = function (path) {
    return fso.fileExists(path);
};

exports.join = function () {
    return Array.prototype.join.call(arguments, "\\");
};

exports.mtime = function (path) {
    return fso.getFile(path).dateLastModified;
}

// TODO
exports.normal = function (path) {
    return path;
};

exports.read = function (path, options) {
    var charset = (options || {}).charset || "utf-8",
        adTypeText = 2,
        text = "";

    stream.open();
        stream.charset = charset;
        stream.type = adTypeText;
        stream.loadFromFile(path);
        text = stream.readText();
    stream.close();

    return text;
};

exports.Path = function (path) { this.valueOf = function () { return this; }; };

})(modules.file = {});

// Loader
// =============================================================================
(function (exports) {
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- cadorn Christoph Dorn

// NOTE: this file is used is the bootstrapping process,
// so any "requires" must be accounted for in narwhal.js

var system = require("system");
// HACK: the stars prevent the file module from being sent to browser
//  clients with the regexen we're using.  we need a real solution
//  for this.
var file = require(/**/"file"/**/);

// this gets swapped out with a full fledged-read before
//  we're done using it
var read = file.read;
var Module = system.Module || system.evaluate; // legacy

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
        // file.join() must collapse multiple "/" into a single "/"
        var searchPaths = file.isAbsolute(topId) ? [""] : paths;
        for (var j = 0; j < extensions.length; j++) {
            var extension = extensions[j];
            for (var i = 0; i < searchPaths.length; i++) {
                var path = file.join(searchPaths[i], topId + extension);
                if (file.isFile(path))
                    return path;
            }
        }
        throw new Error("require error: couldn't find \"" + topId + '"');
    };

    loader.fetch = function (topId, path) {
        if (!path)
            path = loader.find(topId);
        if (typeof file.mtime === "function")
            timestamps[path] = file.mtime(path);
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
        if (system.evaluate) {
            if (!path)
                path = loader.find(topId);
            var factory = Module(text, path, 1);
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
        } else if (typeof file.mtime === "function") {
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
            file.mtime(path) > timestamps[path]
        );
    };

    loader.paths = paths;
    loader.extensions = extensions;

    return loader;
};

exports.resolve = function (id, baseId) {
    id = String(id);
    if (id.charAt(0) == ".") {
        id = file.dirname(baseId) + "/" + id;
    }
    // module ids need to use forward slashes, despite what the OS might say
    return file.normal(id).replace(/\\/g, '/');
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
            if(file.isAbsolute(baseId)) {
                path = file.Path(baseId);
            } else
            if(loader.usingCatalog[basePkg]) {
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
// =============================================================================
(function (exports) {
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License

// NOTE: this file is used is the bootstrapping process,
// so any "requires" must be accounted for in narwhal.js

var system = require("system");

exports.Sandbox = function (options) {
    options = options || {};
    var loader = options.loader;
    var subsystem = options.system || system || {};
    var exportsMemo = options.modules || {};
    var moduleMemo = {};
    var debug = options.debug !== undefined ? !!options.debug : !!system.debug;
    var debugDepth = 0;
    var main;
    var setDisplayName = (system.engine == "jsc");

    // managed print free variable in the sandbox forwards
    // to system.print in the sandbox
    var subprint = options.print || function () {
        return subsystem.print.apply(subsystem, arguments);
    };

    var sandbox = function (id, baseId, pkg, basePkg, options) {

        if (!options)
            options = {};

        if (sandbox.debug)
            print("REQUIRE: id["+id+"] baseId["+baseId+"] pkg["+pkg+"] basePkg["+basePkg+"]");

        if (loader.resolvePkg) {
            var resolveInfo = loader.resolvePkg(id, baseId, pkg, basePkg);
            id = resolveInfo[0];
            pkg = resolveInfo[1];
        } else {
            id = loader.resolve(id, baseId);
        }

        if (sandbox.debug)
            print("USING: id["+id+"] pkg["+pkg+"]");

        /* populate memo with module instance */
        if (!Object.prototype.hasOwnProperty.call(exportsMemo, id) || options.force || options.once) {

            if (sandbox.debug)
                print(new Array(++debugDepth + 1).join("\\") + " " + id, 'module');

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

            // this shim supports both the old factory(r, e, m, s, p) and
            // new factory(scope) module constructor conventions
            var scope = require;

            // require.once provides a scope of extra stuff to inject
            if (options.scope) {
                for (var name in options.scope) {
                    if (Object.prototype.hasOwnProperty.call(options.scope, name)) {
                        scope[name] = options.scope[name];
                    }
                }
            }

            scope.load = load;
            scope.require = require;
            scope.exports = exports;
            scope.module = module;
            scope.system = subsystem;
            scope.print = subprint;

            var completed;
            try {
                factory(scope, exports, module, subsystem, subprint);
                completed = true;
            } finally {
                if (!completed) {
                    delete exportsMemo[id];
                    delete moduleMemo[id];
                }
            }

            /*
            // XXX to be uncommented when the above shim is
            // no longer needed for migration
            var scope = options.scope || {};
            scope.load = load;
            scope.require = require;
            scope.exports = exports;
            scope.module = module;
            scope.system = subsystem;
            scope.print = subprint;
            factory(scope);
            */

            if (sandbox.debug) {
                // check for new globals
                for (var name in global)
                    if (!globals[name])
                        system.print("NEW GLOBAL: " + name);
            }

            if (sandbox.debug)
                print(new Array(debugDepth-- + 1).join("/") + " " + id, 'module');

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
                print(new Array(debugDepth + 1).join("|") + " " + id, 'module');
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
    sandbox.system = system;
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
        module.toString = function () {
            return baseId;
        };
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
        loader = require("loader/prefix").PrefixLoader(prefix, loader);
    var sandbox = exports.Sandbox({
        modules: modules,
        loader: loader,
        system: system,
        print: print,
        debug: debug
    });

    return sandbox.main(main);
};
})(modules.sandbox = {});

// =============================================================================

// Set up paths
require.paths = [".", "lib", "engines/" + require("system").engine + "/lib"];

// Create require
require = require("sandbox").Sandbox({
    loader: require("loader").Loader({
        paths: require.paths,
        debug: require.debug
    }),
    modules: modules,
    debug: require.debug
});

})(this);
