var console = require('console');
var test = require('test');
var print = require.env.print;
test.assert(require.id == 'program', 'sentient');
print('DONE', 'info');
