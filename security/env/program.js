var test = require('test');
test.assert(require.env, 'env exists');
require.env.print('DONE', 'info');
