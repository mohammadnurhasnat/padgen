const fs = require('fs');
let code = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Fix Line 550 template literal mess
code = code.replace(/\{\`> \$\<span style=\{\{ whiteSpace: "nowrap" \}\}\>\{nameFormatted\.toUpperCase\(\)\}\<\/span\>\`\}/g, 
  '<span style={{ whiteSpace: "nowrap" }}>{`> ${nameFormatted.toUpperCase()}`}</span>'
);

fs.writeFileSync('src/components/CardPreview.tsx', code);
