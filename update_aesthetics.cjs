const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

const newTop = `
const PadTopAesthetics: React.FC<{ theme: Theme }> = ({ theme }) => {
  const { primary, accent, secondary, shade2, shade3 } = theme;
  const p = hexToRgba(primary, 0.12);
  const p2 = hexToRgba(primary, 0.08);
  const a = hexToRgba(accent, 0.15);
  const a2 = hexToRgba(accent, 0.1);
  const s = hexToRgba(secondary || primary, 0.08);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45mm', overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      {/* Abstract large background polygons */}
      <div style={{ position: 'absolute', top: '-15mm', left: '-10mm', width: '60mm', height: '40mm', background: p2, clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 80%)' }}></div>
      <div style={{ position: 'absolute', top: '-10mm', right: '-20mm', width: '70mm', height: '50mm', background: a2, clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 0 100%)' }}></div>
      
      {/* Decorative Circles */}
      <div style={{ position: 'absolute', top: '5mm', right: '15mm', width: '25mm', height: '25mm', borderRadius: '50%', border: \`1.5px dashed \${a}\`, opacity: 0.6 }}></div>
      <div style={{ position: 'absolute', top: '15mm', right: '35mm', width: '6mm', height: '6mm', borderRadius: '50%', background: p }}></div>
      <div style={{ position: 'absolute', top: '22mm', left: '12mm', width: '4mm', height: '4mm', borderRadius: '50%', border: \`1px solid \${p}\` }}></div>
      
      {/* Decorative Rectangles & Lines */}
      <div style={{ position: 'absolute', top: '10mm', left: '20mm', width: '15mm', height: '15mm', border: \`2px solid \${s}\`, transform: 'rotate(15deg)', borderRadius: '3px' }}></div>
      <div style={{ position: 'absolute', top: '28mm', left: '-5mm', width: '35mm', height: '2mm', background: \`linear-gradient(90deg, \${p}, transparent)\`, transform: 'rotate(5deg)' }}></div>
      <div style={{ position: 'absolute', top: '35mm', right: '-15mm', width: '45mm', height: '1.5mm', background: \`linear-gradient(-90deg, \${a}, transparent)\`, transform: 'rotate(-10deg)' }}></div>
      
      {/* Micro dots cluster */}
      <div style={{ position: 'absolute', top: '8mm', left: '45%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2mm', opacity: 0.4 }}>
         {[...Array(9)].map((_, i) => <div key={i} style={{width: '2px', height: '2px', borderRadius: '50%', background: primary}}></div>)}
      </div>
    </div>
  );
};
`;

const newBottom = `
const PadBottomAesthetics: React.FC<{ theme: Theme }> = ({ theme }) => {
  const { primary, accent, secondary, shade2, shade3 } = theme;
  const p = hexToRgba(primary, 0.12);
  const p2 = hexToRgba(primary, 0.08);
  const a = hexToRgba(accent, 0.15);
  const s = hexToRgba(secondary || primary, 0.1);

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45mm', overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      {/* Abstract large background polygons */}
      <div style={{ position: 'absolute', bottom: '-15mm', right: '-15mm', width: '80mm', height: '40mm', background: p2, clipPath: 'polygon(100% 100%, 0 100%, 20% 0, 100% 30%)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20mm', left: '-10mm', width: '60mm', height: '50mm', background: hexToRgba(accent, 0.06), clipPath: 'polygon(0 100%, 100% 100%, 80% 0, 0 20%)' }}></div>

      {/* Decorative Circles */}
      <div style={{ position: 'absolute', bottom: '8mm', left: '15mm', width: '30mm', height: '30mm', borderRadius: '50%', border: \`2px solid \${s}\`, opacity: 0.7 }}></div>
      <div style={{ position: 'absolute', bottom: '15mm', left: '10mm', width: '40mm', height: '40mm', borderRadius: '50%', border: \`1px dashed \${a}\`, opacity: 0.4 }}></div>
      <div style={{ position: 'absolute', bottom: '25mm', left: '45mm', width: '5mm', height: '5mm', borderRadius: '50%', background: p }}></div>

      {/* Decorative Rectangles & Lines */}
      <div style={{ position: 'absolute', bottom: '15mm', right: '25mm', width: '12mm', height: '12mm', borderTop: \`3px solid \${a}\`, borderRight: \`3px solid \${a}\`, transform: 'rotate(15deg)', borderRadius: '2px' }}></div>
      <div style={{ position: 'absolute', bottom: '30mm', right: '5mm', width: '25mm', height: '2mm', background: \`linear-gradient(-90deg, \${p}, transparent)\`, transform: 'rotate(-25deg)' }}></div>
      
      {/* Crosshairs */}
      <div style={{ position: 'absolute', bottom: '10mm', right: '15mm', width: '8mm', height: '8mm', opacity: 0.6 }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: primary, transform: 'translateY(-50%)' }}></div>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: primary, transform: 'translateX(-50%)' }}></div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '8mm', left: '60%', transform: 'translateX(-50%)', display: 'flex', gap: '3mm', opacity: 0.5 }}>
         {[1, 2, 3, 4, 5].map(i => <div key={i} style={{width: '4px', height: '4px', transform: 'rotate(45deg)', background: i % 2 === 0 ? primary : accent, borderRadius: '1px'}}></div>)}
      </div>
    </div>
  );
};
`;

code = code.replace(/const PadTopAesthetics: React\.FC<\{ theme: Theme \}> = \(\{ theme \}\) => \{[\s\S]*?const PadBottomAesthetics: React\.FC<\{ theme: Theme \}> = \(\{ theme \}\) => \{[\s\S]*?(?=export const PadPreview:)/, newTop + '\n' + newBottom + '\n');

fs.writeFileSync('src/components/PadPreview.tsx', code);
