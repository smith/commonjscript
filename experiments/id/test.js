
var console = require('console');

exports.assert = function (guard, message) {
    if (guard) {
        console.print('PASS ' + message, 'pass');
    } else {
        console.print('FAIL ' + message, 'fail');
    }
};

