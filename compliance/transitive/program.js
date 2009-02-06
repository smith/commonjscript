var test = require('test');
test.assert(require('a').foo() == 1, 'transitive');
require('console').print('DONE', 'info');
