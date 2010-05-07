<script runat="server" language="javascript">
var tests = ["absolute",
             "cyclic",
             "determinism",
             "exactExports",
             "hasOwnProperty",
             "method",
             "missing",
             "monkeys",
             "nested",
             "relative",
             "transitive"],
    debug = String(Request.QueryString("debug")) !== "undefined";

for (var i = 0; i < tests.length; i += 1) {
    Response.write('<a href="' + tests[i] + '.asp' + (debug ? '?debug=1' : "") +
        '">' + tests[i] + '</a><br />');
}
</script>
