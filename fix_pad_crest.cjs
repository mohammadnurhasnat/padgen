const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// Replace the crest case to remove the circle (which looks like a logo)
const crestRegex = /case 'crest':\s*return \(\s*<div style=\{headerContainerStyle\}>\s*<div style=\{\{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2mm' \}\}>\s*<div style=\{\{[^}]+\}\}>\s*\{name\.substring\(0, 2\)\.toUpperCase\(\)\}\s*<\/div>\s*\{nameEl\}\s*\{taglineEl\}\s*<\/div>\s*<\/div>\s*\);/g;

code = code.replace(crestRegex, `case 'crest':
      return (
        <div style={headerContainerStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2mm' }}>
            {/* Removed circle logo-like element */}
            {nameEl}
            <div style={{ height: '2px', width: '30mm', background: \`linear-gradient(90deg, transparent, \${dColor}, transparent)\` }}></div>
            {taglineEl}
          </div>
        </div>
      );`);

fs.writeFileSync('src/components/PadPreview.tsx', code);
