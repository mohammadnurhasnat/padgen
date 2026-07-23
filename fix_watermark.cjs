const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// First, remove the declaration of logoWatermark completely
code = code.replace(/const logoWatermark = \([\s\S]*?opacity: 0\.05,[\s\S]*?dangerouslySetInnerHTML=\{\{ __html: mark \}\} \/>\n  \);\n/g, '');

// Then replace all instances of {logoWatermark} with empty string
code = code.replace(/\{logoWatermark\}/g, '');

fs.writeFileSync('src/components/PadPreview.tsx', code);
