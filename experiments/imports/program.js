var console = require('console');
var test = require('test');
var print = require.env.print;
try {
    include('foo');
    test.assert(foo() == 1, 'imports bound in local scope');
} catch (exception) {
    print('ERROR ' + exception, 'error');
}
print('DONE', 'info');
