const fs = require('fs');
let content = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Find all layouts
const parts = content.split(/(?=  \/\/ Layout \d+:|  if \(layout ===)/);

// Test on one layout
let block = parts[1]; // Centered layout
if (block.includes('className="card"')) {
    // Add position: relative to the card div style
    block = block.replace('style={{ background: theme.paper, fontFamily: "\'Segoe UI\', Arial, sans-serif" }}', 'style={{ background: theme.paper, fontFamily: "\'Segoe UI\', Arial, sans-serif", position: "relative" }}');
    // Inject QR code
    block = block.replace('        {/* Corner angled triangles */}', '        <div style={{ position: "absolute", bottom: "4mm", right: "4mm" }}><QRCodeDisplay data={data} /></div>\n        {/* Corner angled triangles */}');
    console.log(block.substring(0, 500));
}
