<% // Interoperable JS test runner %>
<script runat="server" language="javascript" src="../require.js"></script>
<script runat="server" language="javascript">
// Each of these inline scripts sets up the load path of require for use in the
// subsequent test suite

// print function
print = environment.print;

print("-- Trivial --");
require.paths = ["suite/trivial"];
</script>
<script runat="server" language="javascript" src="suite/trivial/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Compliance --");
print("");
print("-- Absolute --");
require.paths = ["suite/compliance/absolute"];
</script>
<script runat="server" language="javascript" src="suite/compliance/absolute/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Cyclic --");
require.paths = ["suite/compliance/cyclic"];
</script>
<script runat="server" language="javascript" src="suite/compliance/cyclic/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Exact Exports --");
require.paths = ["suite/compliance/exactExports"];
</script>
<script runat="server" language="javascript" src="suite/compliance/exactExports/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Has Own Property --");
require.paths = ["suite/compliance/hasOwnProperty"];
print("THROWS ERROR SO IS NOT HERE YET");
</script>
<script runat="server" language="javascript">
print("");
print("-- Method --");
require.paths = ["suite/compliance/method"];
</script>
<script runat="server" language="javascript" src="suite/compliance/method/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Missing --");
require.paths = ["suite/compliance/missing"];
</script>
<script runat="server" language="javascript" src="suite/compliance/missing/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Monkeys! --");
require.paths = ["suite/compliance/monkeys"];
</script>
<script runat="server" language="javascript" src="suite/compliance/monkeys/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Nested --");
require.paths = ["suite/compliance/nested"];
</script>
<script runat="server" language="javascript" src="suite/compliance/nested/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Relative --");
require.paths = ["suite/compliance/relative"];
</script>
<script runat="server" language="javascript" src="suite/compliance/relative/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Transitive --");
require.paths = ["suite/compliance/transitive"];
</script>
<script runat="server" language="javascript" src="suite/compliance/transitive/program.js"></script>

