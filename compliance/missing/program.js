var test = require('test');
var console = require('console');
try {
    test.assert(require('bogus') === undefined, 'require returns undefined when module not found');
} catch (exception) {
    console.print('FAIL require threw an error instead of returning undefined', 'fail');
}
console.print('DONE', 'info');
