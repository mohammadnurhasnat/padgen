const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// We will insert PadTopAesthetics before PadPreview
const shapesComponent = `
const PadTopAesthetics: React.FC<{ theme: Theme }> = ({ theme }) => {
  const { primary, accent, secondary, shade2, shade3 } = theme;
  const p = hexToRgba(primary, 0.15);
  const a = hexToRgba(accent, 0.2);
  const s = hexToRgba(secondary || primary, 0.1);
  const s2 = hexToRgba(shade2 || primary, 0.12);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40mm', overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      {/* Circle */}
      <div style={{ position: 'absolute', top: '-15mm', right: '10mm', width: '30mm', height: '30mm', borderRadius: '50%', background: p, filter: 'blur(2px)' }}></div>
      <div style={{ position: 'absolute', top: '5mm', right: '35mm', width: '8mm', height: '8mm', borderRadius: '50%', border: \`1.5px solid \${hexToRgba(accent, 0.4)}\` }}></div>
      
      {/* Square / 4-corner */}
      <div style={{ position: 'absolute', top: '15mm', left: '15mm', width: '12mm', height: '12mm', background: s, transform: 'rotate(45deg)', borderRadius: '2px' }}></div>
      <div style={{ position: 'absolute', top: '-5mm', left: '35mm', width: '25mm', height: '25mm', border: \`2px solid \${a}\`, transform: 'rotate(15deg)', borderRadius: '4px' }}></div>
      
      {/* Long shapes / lines */}
      <div style={{ position: 'absolute', top: '25mm', right: '-10mm', width: '45mm', height: '3mm', background: \`linear-gradient(90deg, transparent, \${s2})\`, transform: 'rotate(-25deg)', borderRadius: '2px' }}></div>
      <div style={{ position: 'absolute', top: '8mm', left: '-5mm', width: '35mm', height: '5mm', background: \`linear-gradient(90deg, \${p}, transparent)\`, transform: 'rotate(10deg)', borderRadius: '2px' }}></div>
      
      {/* Dots pattern */}
      <div style={{ position: 'absolute', top: '10mm', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3mm', opacity: 0.5 }}>
         <div style={{width: '3px', height: '3px', borderRadius: '50%', background: primary}}></div>
         <div style={{width: '3px', height: '3px', borderRadius: '50%', background: accent}}></div>
         <div style={{width: '3px', height: '3px', borderRadius: '50%', background: secondary || primary}}></div>
      </div>
    </div>
  );
};
`;

code = code.replace(/export const PadPreview: React\.FC<PadPreviewProps> = \(\{/, shapesComponent + '\nexport const PadPreview: React.FC<PadPreviewProps> = ({');

// Now we inject `<PadTopAesthetics theme={theme} />` right after the shading radial-gradient in every layout.
// The shading is `<div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: \`radial-gradient... zIndex: 0, pointerEvents: "none" }}></div>`
code = code.replace(/(<div style=\{\{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient[^>]+><\/div>)/g, '$1\n        <PadTopAesthetics theme={theme} />');

fs.writeFileSync('src/components/PadPreview.tsx', code);
