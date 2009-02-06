var test = require('test');
var console = require('console');
test.assert(require.env, 'env exists');
console.print('DONE', 'info');
