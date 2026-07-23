const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// Remove the leftover `} else if (gridStyle === 'lines') { gridStyles... }`
code = code.replace(/  \} else if \(gridStyle === 'lines'\) \{\n    gridStyles\.backgroundImage = \`linear-gradient\(\$\{hexToRgba\(prim, 0\.06\)\} 1px, transparent 1px\)\`;\n    gridStyles\.backgroundSize = '100% 8mm';\n    gridStyles\.marginTop = '6mm';\n    gridStyles\.marginBottom = '6mm';\n  \}/, '');

fs.writeFileSync('src/components/PadPreview.tsx', code);
