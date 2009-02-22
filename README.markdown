Interoperable JScript
=====================

This is an implemtation of the [JavaScript Securable Modules Specification](https://wiki.mozilla.org/ServerJS/Modules/SecurableModules) meant to run on ASP. The implemtation is based on the one used in [Jack](http://jackjs.org).

# Usage

`require.js` can be included in a ASP/JScript page to provide the `require` function.

`test.asp` includes a runner for some of the tests in the [interoperablejs test suite](http://code.google.com/p/interoperablejs/). To run the tests, check out 
the suite from Google Code, drop `require.js` and `test.asp` in the root, and 
visit the location of `test.asp` on a webserver with ASP enabled.
