const fs = require('fs');
let content = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Find all occurrences of something containing data.address and data.email
// We can find the innermost tags containing data.address or data.email.

const layouts = content.split(/(?=\/\/ Layout \d+:|  if \(layout ===)/);
console.log(`Found ${layouts.length} blocks`);
