// commonjscript test runner

require.paths.push("../lib"); // to get system module

var print = require("system").print,
    modulesSpecVersion = "1.0";
    tests = ["absolute",
             "cyclic",
             "determinism",
             "exactExports",
             "hasOwnProperty",
             "method",
             "missing",
             "monkeys",
             "nested",
             "relative",
             "transitive"];

function run(test) {
    require.paths = ["commonjs/tests/modules/" + modulesSpecVersion + "/" +
                     test];
    print("-- " + test + "--")
    require("program");
    print("");
}

for (var i = 0; i < tests.length; i += 1) { run(tests[i]); }
