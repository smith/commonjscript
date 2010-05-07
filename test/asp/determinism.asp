<script runat="server" language="javascript" src="../../require.js"></script>
<script runat="server" language="javascript">
require("system").print("-- determinism --");
require.paths.unshift("../commonjs/tests/modules/1.0/determinism");
require.debug = String(Request.QueryString("debug")) !== "undefined";
require("program");
</script>
