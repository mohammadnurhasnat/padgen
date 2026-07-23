const fs = require('fs');

function extractBlocks(file) {
  let content = fs.readFileSync(file, 'utf8');
  let parts = content.split(/(?=  \/\/ Layout \d+:|  if \(layout ===)/);
  
  for (let i = 1; i < parts.length; i++) {
    let lines = parts[i].split('\n');
    let startIdx = -1;
    let endIdx = -1;
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].includes('data.address')) {
        startIdx = Math.max(0, j - 1);
        while (startIdx > 0 && !lines[startIdx].includes('<div') && !lines[startIdx].includes('<span')) startIdx--;
        
        endIdx = j + 1;
        while (endIdx < lines.length && !lines[endIdx].includes('data.email')) endIdx++;
        if (endIdx < lines.length) {
          endIdx++; // include the email line
          while (endIdx < lines.length && !lines[endIdx].includes('</div') && !lines[endIdx].includes('</span')) endIdx++;
        }
        break;
      }
    }
    
    if (startIdx !== -1 && endIdx !== -1) {
      console.log(`\n--- ${file} Block ${i} ---`);
      console.log(lines.slice(startIdx, endIdx + 1).join('\n'));
    }
  }
}

// extractBlocks('src/components/CardPreview.tsx');
extractBlocks('src/components/PadPreview.tsx');
