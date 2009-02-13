var console = require('console');
var test = require('test');
var print = environment.print;
test.assert(require.isLoaded('program'), 'current isLoaded');
test.assert(require.isLoaded('a') == false, 'not yet loaded');
require('a');
test.assert(require.isLoaded('a'), 'depdendency is loaded');
print('DONE', 'info');
