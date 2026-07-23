const fs = require('fs');
let code = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Replace {nameFormatted.toUpperCase()}
code = code.replace(/\{nameFormatted\.toUpperCase\(\)\}/g, '<span style={{ whiteSpace: "nowrap" }}>{nameFormatted.toUpperCase()}</span>');

// Replace {\`> \${nameFormatted.toUpperCase()}\`}
code = code.replace(/\{\`> \$\{nameFormatted\.toUpperCase\(\)\}\`\}/g, '<span style={{ whiteSpace: "nowrap" }}>{`> ${nameFormatted.toUpperCase()}`}</span>');

fs.writeFileSync('src/components/CardPreview.tsx', code);
