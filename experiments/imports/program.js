var console = require('console');
var test = require('test');
try {
    include('foo');
    test.assert(foo() == 1, 'imports bound in local scope');
} catch (exception) {
    console.print('ERROR ' + exception, 'error');
}
console.print('DONE', 'info');
