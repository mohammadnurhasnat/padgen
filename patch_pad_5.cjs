const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

const newShading = '<div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 0% 0%, ${hexToRgba(prim, 0.04)} 0%, transparent 30%), radial-gradient(circle at 100% 0%, ${hexToRgba(acc, 0.035)} 0%, transparent 35%), radial-gradient(circle at 0% 100%, ${hexToRgba(acc, 0.035)} 0%, transparent 35%), radial-gradient(circle at 100% 100%, ${hexToRgba(prim, 0.04)} 0%, transparent 30%)`, zIndex: 0, pointerEvents: "none" }}></div>';

code = code.replace(/<div style=\{\{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: \`radial-gradient\(circle at 100% 0%, \$\{hexToRgba\(prim, 0\.04\)\} 0%, transparent 40%\), radial-gradient\(circle at 0% 100%, \$\{hexToRgba\(acc, 0\.04\)\} 0%, transparent 40%\)\`, zIndex: 0, pointerEvents: "none" \}\}>\<\/div>/g, newShading);

fs.writeFileSync('src/components/PadPreview.tsx', code);
