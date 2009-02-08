var test = require('test');
var print = require.env.print;

exports.foo = require.curryId(function (id) {
    return id;
});

var a = require('a');
print(a.foo());
test.assert(a.foo() == 'program', 'curryId');
test.assert(exports.foo() == 'program', 'curryId in own module');

print('DONE', 'info');
