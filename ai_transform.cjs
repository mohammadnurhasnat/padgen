const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  const parts = content.split(/(?=  \/\/ Layout \d+:|  if \(layout ===)/);
  
  console.log(`Processing ${filename}, found ${parts.length} blocks.`);
  
  for (let i = 1; i < parts.length; i++) {
    let block = parts[i];
    if (!block.includes('data.address')) continue;

    // Use Gemini to rewrite the contact section.
    // We only send the block and ask it to output the transformed block.
    const prompt = `
You are an expert React developer. I have a React component block for a print template layout.
Currently, the contact information (address, phone/mobile, email) is rendered in various ways (inline with bullets, etc.).
I need you to update ONLY the contact information section of this block according to these strict rules:

1. The Address must be strictly on its own line (block level).
2. The Phone/Mobile and Email must be rendered below the Address.
3. Phone and Email should be side-by-side if they fit, but they MUST wrap cleanly without breaking inside (use \`<span style={{ whiteSpace: 'nowrap' }}>\`).
4. Format it using flexbox like this:
   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8mm' }}>
     <div style={{ /* keep original alignment/color/font styles but ensure block level */ }}>{data.address}</div>
     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm', /* keep original styles */ }}>
       <span style={{ whiteSpace: 'nowrap' }}>Mobile: {mobileNumber}</span> (or Phone: {data.phone})
       <span style={{ whiteSpace: 'nowrap' }}>Email: {data.email}</span>
     </div>
   </div>
5. PRESERVE ALL ORIGINAL STYLES (colors, fonts, alignments, margins) of the outer container. Do NOT change other parts of the layout block.
6. Only return the updated code block, with NO markdown formatting, NO backticks, NO explanations. Just the raw code.
7. Note: Use \`mobileNumber\` if it's CardPreview, or \`data.phone\` if it's PadPreview. Use whatever variables were already used in the block.

Here is the block:
${block}
`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { temperature: 0.1 }
      });
      
      let newBlock = response.text;
      newBlock = newBlock.replace(/^```tsx?\n/, '').replace(/```$/, '').trim();
      
      // Basic sanity check: if it didn't completely hallucinate
      if (newBlock.includes('layout ===') && newBlock.includes('data.address')) {
        parts[i] = newBlock + '\n';
        console.log(`Successfully updated block ${i}`);
      } else {
        console.log(`Failed sanity check for block ${i}`);
      }
    } catch (e) {
      console.error(`Error processing block ${i}:`, e.message);
    }
  }
  
  fs.writeFileSync(filename + '.ai.tsx', parts.join(''));
}

async function run() {
  await processFile('src/components/CardPreview.tsx.new'); // The one with wrapper
  await processFile('src/components/PadPreview.tsx');
}

run();
