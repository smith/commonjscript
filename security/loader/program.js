var test = require('test');
test.assert(require.loader, 'loader exists');
require.env.print('DONE', 'info');
