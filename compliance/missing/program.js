var test = require('test');
var console = require('console');
try {
    require('bogus');
    console.print('FAIL require throws error when module missing', 'fail');
} catch (exception) {
    console.print('PASS require throws error when module missing', 'pass');
}
console.print('DONE', 'info');
