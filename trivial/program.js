//
// program.js
//

var print;
if (environment.print) {
    print = environment.print;
} else if (typeof alert !== "undefined") {
    print = alert;
}

var inc = require('increment').increment;
var a = 1;
print("inc(" + a + ") = " + inc(a))

