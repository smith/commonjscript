var print = require.env.print;

exports.foo = require.curryId(function (id) {
    return id;
});

exports.bar = function () {
    return program.foo();
};

var program = require('program');

