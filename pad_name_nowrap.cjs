const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// Replace {nameFormatted} with <span style={{ whiteSpace: "nowrap" }}>{nameFormatted}</span>
// if it's not already wrapped.
code = code.replace(/\{nameFormatted\}/g, '<span style={{ whiteSpace: "nowrap" }}>{nameFormatted}</span>');
code = code.replace(/\{nameFormatted\.toUpperCase\(\)\}/g, '<span style={{ whiteSpace: "nowrap" }}>{nameFormatted.toUpperCase()}</span>');

// Replace the logo in corporate-column (line ~764)
// We will just remove it entirely.
code = code.replace(/<div dangerouslySetInnerHTML=\{\{ __html: mark \}\} style=\{\{ width: '100%', height: '100%' \}\} \/>/g, '');

fs.writeFileSync('src/components/PadPreview.tsx', code);
