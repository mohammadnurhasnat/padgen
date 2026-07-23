const fs = require('fs');
let code = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

code = code.replace(/<div key=\{i\} style=\{\{ width: '1\.8px', height: '1\.8px', borderRadius: '50%', backgroundColor: i === 2 \? theme\.accent : dColor, opacity: 0\.8 \}\} dangerouslySetInnerHTML=\{\{ __html: mark \}\} \/>/g, "<div key={i} style={{ width: '1.8px', height: '1.8px', borderRadius: '50%', backgroundColor: i === 2 ? theme.accent : dColor, opacity: 0.8 }} />");

fs.writeFileSync('src/components/CardPreview.tsx', code);
