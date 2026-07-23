const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

const replacement = `  let repeatedNamePattern = null;
  if (gridStyle === 'dots') {
    backgroundGridStyles.backgroundImage = \\\`radial-gradient(circle, \\\${hexToRgba(prim, 0.22)} 1.5px, transparent 1.5px)\\\`;
    backgroundGridStyles.backgroundSize = '5mm 5mm';
  } else if (gridStyle === 'lines') {
    backgroundGridStyles.backgroundImage = \\\`linear-gradient(\\\${hexToRgba(prim, 0.08)} 1px, transparent 1px), linear-gradient(90deg, \\\${hexToRgba(prim, 0.03)} 1px, transparent 1px)\\\`;
    backgroundGridStyles.backgroundSize = '100% 6.5mm, 6.5mm 100%';
  } else if (gridStyle === 'repeated-name') {
    const fontStr = headlineFont.replace(/['"]/g, '');
    const cleanCompanyName = data.companyName.replace(/[<>]/g, '');
    const svgStr = \\\`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="40"><text x="0" y="24" fill="\\\${hexToRgba(prim, 0.06).replace(/#/g, '%23')}" font-family="\\\${fontStr}" font-size="12px" font-weight="600" letter-spacing="1px" white-space="nowrap">\\\${Array.from({length: 40}).map(() => cleanCompanyName + "    •    ").join('')}</text></svg>\\\`;
    backgroundGridStyles.backgroundImage = \\\`url("data:image/svg+xml;utf8,\\\${svgStr}")\\\`;
    backgroundGridStyles.backgroundSize = '1200px 40px';
  }`;

code = code.replace(/if \(gridStyle === 'dots'\) \{[\s\S]*?backgroundGridStyles\.backgroundSize = '100% 6\.5mm, 6\.5mm 100%';\s*\}/, replacement.replace(/\\\\/g, '\\'));

fs.writeFileSync('src/components/PadPreview.tsx', code);
