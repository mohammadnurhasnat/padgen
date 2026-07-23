const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// Update renderDecorationsAroundName nameEl
code = code.replace(
  /<div style={{ fontFamily: headlineFont, fontSize: \`\${nameSize - 1}pt\`, fontWeight: 'bold', letterSpacing: '\.03em', color: theme\.primary, lineHeight: 1\.15 }}>/g,
  '<div style={{ fontFamily: headlineFont, fontSize: `${nameSize - 1}pt`, fontWeight: "bold", letterSpacing: ".03em", color: theme.primary, lineHeight: 1.15, whiteSpace: "nowrap" }}>'
);

// Define backgroundGridStyles
const bgGridCode = `
  // Setup the grid layout styles beautifully
  const backgroundGridStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  };

  if (gridStyle === 'dots') {
    backgroundGridStyles.backgroundImage = \`radial-gradient(circle, \${hexToRgba(prim, 0.15)} 1px, transparent 1px)\`;
    backgroundGridStyles.backgroundSize = '5mm 5mm';
  } else if (gridStyle === 'lines') {
    backgroundGridStyles.backgroundImage = \`linear-gradient(\${hexToRgba(prim, 0.08)} 1px, transparent 1px), linear-gradient(90deg, \${hexToRgba(prim, 0.03)} 1px, transparent 1px)\`;
    backgroundGridStyles.backgroundSize = '100% 6.5mm, 6.5mm 100%';
  }

  const microShading = (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: \`radial-gradient(circle at 100% 0%, \${hexToRgba(prim, 0.04)} 0%, transparent 40%), radial-gradient(circle at 0% 100%, \${hexToRgba(acc, 0.04)} 0%, transparent 40%)\`,
      zIndex: 0,
      pointerEvents: 'none',
    }}></div>
  );
`;

// Replace the old gridStyles definition
code = code.replace(
  /  \/\/ Setup the grid layout styles beautifully[\s\S]*?marginBottom = '6mm';\n  }/g,
  bgGridCode
);

// We want to insert the background grid and shading right after `<div className="pad"...>`
// Since we have many layouts, we'll just replace `<div className="pad" style={{ background: customPaper, fontFamily: "'Segoe UI', Arial, sans-serif" }}>`
code = code.replace(
  /<div className="pad" style={{ background: customPaper, fontFamily: "'Segoe UI', Arial, sans-serif" }}>/g,
  '<div className="pad" style={{ background: customPaper, fontFamily: "\'Segoe UI\', Arial, sans-serif" }}>\n        {gridStyle !== \'none\' && <div style={backgroundGridStyles}></div>}\n        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 100% 0%, ${hexToRgba(prim, 0.04)} 0%, transparent 40%), radial-gradient(circle at 0% 100%, ${hexToRgba(acc, 0.04)} 0%, transparent 40%)`, zIndex: 0, pointerEvents: "none" }}></div>'
);

// Now remove the `<div style={gridStyles}></div>` instances
code = code.replace(/<div style={gridStyles}><\/div>/g, '');

fs.writeFileSync('src/components/PadPreview.tsx', code);
