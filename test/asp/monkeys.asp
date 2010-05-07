<script runat="server" language="javascript" src="../../require.js"></script>
<script runat="server" language="javascript">
require("system").print("-- monkeys --");
require.paths.unshift("../commonjs/tests/modules/1.0/monkeys");
require.debug = String(Request.QueryString("debug")) !== "undefined";
require("program");
</script>
