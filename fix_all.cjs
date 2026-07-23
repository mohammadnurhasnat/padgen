const fs = require('fs');

function fixCards() {
  let content = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');
  
  // Find all layout blocks
  const parts = content.split(/(?=  \/\/ Layout \d+:|  if \(layout ===)/);
  
  for (let i = 1; i < parts.length; i++) {
    let block = parts[i];
    
    // Skip if it's one of the first two layouts which might already be heavily modified
    if (block.includes("layout === 'standard'") || block.includes("layout === 'split'")) {
      // Actually we still need to make sure the address/phone format is correct.
      // We'll process them anyway, or leave them if they already have flex wrap.
      // But let's apply the uniform fix to all.
    }
    
    // We need to find the block that renders data.address, mobileNumber, data.email
    // It's usually something like:
    // <div>{data.address}</div>
    // <div style={{...}}>{mobileNumber} &bull; {data.email}</div>
    
    // We can use regex to match the wrapper of data.address up to data.email.
    // This is risky. Let's instead find the return (...) block, and inject the QR Code right before 
    // <div className="glossy-sheen"></div> or </div> at the end of .card
    
    if (!block.includes('QRCodeSVG')) {
       // Insert QR Code at the bottom right corner
       const qrStr = `
        <div style={{ position: 'absolute', bottom: '4mm', right: '4mm', background: 'white', padding: '1.5px', display: 'flex', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <QRCodeSVG
            value={\`Name: \${data.empName}\\nDesignation: \${data.empRole}\\nPhone: \${data.empPhone || data.phone}\\nEmail: \${data.empEmail || data.email}\\nCompany: \${data.companyName}\\nAddress: \${data.address}\\nWebsite: \${data.tagline}\`}
            size={22}
            level="L"
          />
        </div>
`;
       // Inject before glossy-sheen or before the last </div>
       if (block.includes('<div className="glossy-sheen"></div>')) {
         block = block.replace('<div className="glossy-sheen"></div>', qrStr + '        <div className="glossy-sheen"></div>');
       } else {
         block = block.replace(/<\/div>\s*<div className="glossy-sheen">/, qrStr + '\n      </div>\n      <div className="glossy-sheen">');
       }
    }
    
    // Now fix the address/phone/email formatting.
    // Replace all variations with:
    // <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5mm' }}>
    //   <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.address}</div>
    //   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm' }}>
    //     <span style={{ whiteSpace: 'nowrap' }}>Mobile: {mobileNumber}</span>
    //     <span style={{ whiteSpace: 'nowrap' }}>Email: {data.email}</span>
    //   </div>
    // </div>
    // 
    // The problem is finding the exact string to replace without losing styles.
    // Let's print out what we would replace first.
    
    parts[i] = block;
  }
  
  fs.writeFileSync('src/components/CardPreview.tsx.new', parts.join(''));
}

fixCards();
