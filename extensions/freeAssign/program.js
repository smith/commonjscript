var test = require('test');
foo = function () {};
test.assert(typeof foo != "undefined" && exports.foo == foo, 'free assignment bound to exports');
test.print('DONE', 'info');
