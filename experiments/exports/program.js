var console = require('console');
var test = require('test');
exports.foo = function () {
    return 1;
};
try {
    test.assert(foo() == 1, 'exports bound in local scope');
} catch (exception) {
    console.print('ERROR ' + exception, 'error');
}
console.print('DONE', 'info');
