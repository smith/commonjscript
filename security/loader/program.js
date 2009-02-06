var test = require('test');
var console = require('console');
test.assert(require.loader, 'loader exists');
console.print('DONE', 'info');
