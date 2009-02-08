var console = require('console');
var test = require('test');
var print = require.env.print;
exports.foo = function () {
    return 1;
};
try {
    test.assert(foo() == 1, 'exports bound in local scope');
} catch (exception) {
    print('ERROR ' + exception, 'error');
}
print('DONE', 'info');
