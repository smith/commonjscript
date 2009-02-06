var console = require('console');
var test = require('test');
var a = require('a');
console.print(a.foo());
test.assert(a.foo() == 'program', 'curryId');
console.print('DONE', 'info');
