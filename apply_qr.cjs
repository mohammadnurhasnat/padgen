const fs = require('fs');
let content = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Find all layouts
const parts = content.split(/(?=  \/\/ Layout \d+:|  if \(layout ===)/);

for (let i = 1; i < parts.length; i++) {
    let block = parts[i];
    if (!block.includes('className="card"')) continue;
    if (block.includes('QRCodeDisplay')) continue; // Already has it

    // Add position: relative to style
    // Use regex to match the style attribute content
    block = block.replace(/(className="card" style={{)([^}]+)(}})/, '$1$2, position: "relative"$3');
    
    // Inject QR code before the last closing div of the card
    // This is the hard part - finding the last </div>
    // Actually, I can just inject it right after the opening <div className="card"...>
    
    block = block.replace(/(className="card" style={{[^}]+}})(\s*>)/, '$1$2\n        <div style={{ position: "absolute", bottom: "4mm", right: "4mm", zIndex: 100 }}><QRCodeDisplay data={data} /></div>');
    
    parts[i] = block;
}

fs.writeFileSync('src/components/CardPreview.tsx', parts.join(''));
