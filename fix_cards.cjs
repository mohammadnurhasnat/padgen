const fs = require('fs');
let content = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

const blocks = content.split(/(?=  \/\/ Layout \d+:|  if \(layout ===)/);
console.log(`Found ${blocks.length} blocks`);

let newContent = blocks[0]; // the imports and prefix

for (let i = 1; i < blocks.length; i++) {
  let block = blocks[i];
  // check if block has data.address
  if (!block.includes('data.address')) {
    newContent += block;
    continue;
  }
  
  if (block.includes('QRCodeSVG') && i > 2) {
    // Already has QR code, maybe from previous manual edits? (Though we know only first 2 have it)
  }

  // We want to replace the contact section with the new standardized format.
  // The user wants: Address on one line. Phone and Email on the next line.
  // No breaking inside phone or email.
  // We can look for the div or span containing data.address
  // But wait, it's easier to just append the QR code to the `.content` div or wrapper.
  
  // Actually, to format the address properly:
  // We can replace things like:
  // <div>{data.address}</div>
  // <div ...>{mobileNumber} &bull; {data.email}</div>
  // Or:
  // {data.address} &bull; Ph: {mobileNumber} &bull; {data.email}
  // With a unified component.
  
  // Let's print out the match for data.address for inspection
  const match = block.match(/<div[^>]*>[\s\S]*?data\.address[\s\S]*?<\/div>/);
  if (match) {
    // console.log(`\nBlock ${i}:`);
    // console.log(match[0].substring(0, 200));
  }
}
