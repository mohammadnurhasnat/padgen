const fs = require('fs');
let code = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Update renderDecorationsAroundNameCard nameEl
code = code.replace(
  /<div style={{ fontFamily: headlineFont, fontSize: \`\${cardNameSize}pt\`, fontWeight: 'bold', color: theme\.primary, letterSpacing: '\.03em', lineHeight: 1\.15 }}>/g,
  '<div style={{ fontFamily: headlineFont, fontSize: `${cardNameSize}pt`, fontWeight: "bold", color: theme.primary, letterSpacing: ".03em", lineHeight: 1.15, whiteSpace: "nowrap" }}>'
);

// We also need to add whiteSpace: 'nowrap' to the other instances where {nameFormatted} is used inside CardPreview.tsx
code = code.replace(/\{nameFormatted\}/g, '<span style={{ whiteSpace: "nowrap" }}>{nameFormatted}</span>');

fs.writeFileSync('src/components/CardPreview.tsx', code);
