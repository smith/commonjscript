CommonJScript
=============

CommonJScript is an implementation of the [CommonJS API](http://commonjs.org/) for Classic ASP.

The [Modules/1.0](http://commonjs.org/specs/modules/1.0/) specification is currently implemented. Various others are planned for the future.

Usage
-----

*require.js* can be included in a ASP page or to provide the `require` function.

Some other basic modules (system, engine, file) are also included in that file.

Tests
-----

The [CommonJS modules test suite](http://github.com/commonjs/commonjs/tree/master/tests/modules/1.0) can be run:

    git submodule init
    git submodule update

Load *test/index.asp* on ASP to run the tests. `debug=1` can be passed in the query string to turn `require.debug` on.

Acknowledgements
----------------

Most of the code is taken directly from [Narwhal](http://narwhaljs.org) and [narwhal-lib](http://github.com/kriskowal/narwhal-lib/), so thanks to everyone working on those.

License
-------

Copyright (c) 2010 Nathan L Smith <nlloyds@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
