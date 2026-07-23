const fs = require('fs');
let code = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

code = code.replace(/\}\}\s*\/>/g, '}} dangerouslySetInnerHTML={{ __html: mark }} />');

fs.writeFileSync('src/components/CardPreview.tsx', code);
