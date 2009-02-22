<% // Interoperable JS test runner %>
<script runat="server" language="javascript" src="require.js"></script>
<script runat="server" language="javascript">
// Each of these inline scripts sets up the load path of require for use in the
// subsequent test suite

// print function
print = environment.print;

print("-- Trivial --");
require.paths = ["trivial"];
</script>
<script runat="server" language="javascript" src="trivial/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Compliance --");
print("");
print("-- Absolute --");
require.paths = ["compliance/absolute"];
</script>
<script runat="server" language="javascript" src="compliance/absolute/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Cyclic --");
require.paths = ["compliance/cyclic"];
</script>
<script runat="server" language="javascript" src="compliance/cyclic/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Exact Exports --");
require.paths = ["compliance/exactExports"];
</script>
<script runat="server" language="javascript" src="compliance/exactExports/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Has Own Property --");
require.paths = ["compliance/hasOwnProperty"];
print("THROWS ERROR SO IS NOT HERE YET");
</script>
<script runat="server" language="javascript">
print("");
print("-- Method --");
require.paths = ["compliance/method"];
</script>
<script runat="server" language="javascript" src="compliance/method/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Missing --");
require.paths = ["compliance/missing"];
</script>
<script runat="server" language="javascript" src="compliance/missing/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Monkeys! --");
require.paths = ["compliance/monkeys"];
</script>
<script runat="server" language="javascript" src="compliance/monkeys/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Nested --");
require.paths = ["compliance/nested"];
</script>
<script runat="server" language="javascript" src="compliance/nested/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Relative --");
require.paths = ["compliance/relative"];
</script>
<script runat="server" language="javascript" src="compliance/relative/program.js"></script>
<script runat="server" language="javascript">
print("");
print("-- Transitive --");
require.paths = ["compliance/transitive"];
</script>
<script runat="server" language="javascript" src="compliance/transitive/program.js"></script>

