<% // Interoperable JS test runner %>
<script runat="server" language="javascript" src="../require.js"></script>
<script runat="server" language="javascript">
// Each of these inline scripts sets up the load path of require for use in the
// subsequent test suite

// print function
var sys = require("sys"),
    print = sys.print;

print("-- Trivial --");
require.paths = ["suite/trivial"];
</script>
<script runat="server" language="javascript" src="suite/trivial/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Compliance --");
print("");
print("absolute");
require.paths = ["suite/compliance/absolute"];
</script>
<script runat="server" language="javascript" src="suite/compliance/absolute/program.js"></script>
<script runat="server" language="javascript">
print("");
print("cyclic");
require.paths = ["suite/compliance/cyclic"];
</script>
<script runat="server" language="javascript" src="suite/compliance/cyclic/program.js"></script>
<script runat="server" language="javascript">
print("");
print("determinism");
require.paths = ["suite/compliance/determinism"];
</script>
<script runat="server" language="javascript" src="suite/compliance/determinism/program.js"></script>
<script runat="server" language="javascript">
print("");
print("exactExports");
require.paths = ["suite/compliance/exactExports"];
</script>
<script runat="server" language="javascript" src="suite/compliance/exactExports/program.js"></script>
<script runat="server" language="javascript">
print("");
print("hasOwnProperty");
require.paths = ["suite/compliance/hasOwnProperty"];
</script>
<script runat="server" language="javascript" src="suite/compliance/hasOwnProperty/program.js"></script>
<script runat="server" language="javascript">
print("");
print("method");
require.paths = ["suite/compliance/method"];
</script>
<script runat="server" language="javascript" src="suite/compliance/method/program.js"></script>
<script runat="server" language="javascript">
print("");
print("missing");
require.paths = ["suite/compliance/missing"];
</script>
<script runat="server" language="javascript" src="suite/compliance/missing/program.js"></script>
<script runat="server" language="javascript">
print("");
print("monkeys");
require.paths = ["suite/compliance/monkeys"];
</script>
<script runat="server" language="javascript" src="suite/compliance/monkeys/program.js"></script>
<script runat="server" language="javascript">
print("");
print("nested");
require.paths = ["suite/compliance/nested"];
</script>
<script runat="server" language="javascript" src="suite/compliance/nested/program.js"></script>
<script runat="server" language="javascript">
print("");
print("reflexive");
require.paths = ["suite/compliance/reflexive"];
</script>
<script runat="server" language="javascript" src="suite/compliance/reflexive/program.js"></script>
<script runat="server" language="javascript">
print("");
print("relative");
require.paths = ["suite/compliance/relative"];
</script>
<script runat="server" language="javascript" src="suite/compliance/relative/program.js"></script>
<script runat="server" language="javascript">
print("");
print("transitive");
require.paths = ["suite/compliance/transitive"];
</script>
<script runat="server" language="javascript" src="suite/compliance/transitive/program.js"></script>

