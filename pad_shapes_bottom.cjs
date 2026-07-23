const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

// I will insert a new component for bottom shapes and inject it similar to PadTopAesthetics
const bottomShapesComponent = `
const PadBottomAesthetics: React.FC<{ theme: Theme }> = ({ theme }) => {
  const { primary, accent, secondary, shade2, shade3 } = theme;
  const p = hexToRgba(primary, 0.12);
  const a = hexToRgba(accent, 0.15);
  const s = hexToRgba(secondary || primary, 0.1);

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35mm', overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      {/* Circle bottom left */}
      <div style={{ position: 'absolute', bottom: '-15mm', left: '15mm', width: '35mm', height: '35mm', borderRadius: '50%', border: \`3px solid \${a}\`, opacity: 0.8, filter: 'blur(1px)' }}></div>
      <div style={{ position: 'absolute', bottom: '10mm', left: '50mm', width: '6mm', height: '6mm', borderRadius: '50%', background: p }}></div>
      
      {/* Angles / shapes bottom right */}
      <div style={{ position: 'absolute', bottom: '5mm', right: '20mm', width: '15mm', height: '15mm', borderTop: \`2px solid \${p}\`, borderRight: \`2px solid \${p}\`, transform: 'rotate(25deg)', borderRadius: '2px' }}></div>
      <div style={{ position: 'absolute', bottom: '15mm', right: '5mm', width: '30mm', height: '4mm', background: \`linear-gradient(-90deg, \${s}, transparent)\`, transform: 'rotate(-15deg)', borderRadius: '2px' }}></div>
      
      {/* Pattern elements bottom center */}
      <div style={{ position: 'absolute', bottom: '5mm', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '2mm', opacity: 0.6 }}>
         {[1, 2, 3, 4].map(i => <div key={i} style={{width: '6px', height: '2px', background: i % 2 === 0 ? primary : accent, borderRadius: '1px'}}></div>)}
      </div>
    </div>
  );
};
`;

code = code.replace(/export const PadPreview: React\.FC<PadPreviewProps> = \(\{/, bottomShapesComponent + '\nexport const PadPreview: React.FC<PadPreviewProps> = ({');

// Inject <PadBottomAesthetics theme={theme} /> right after <PadTopAesthetics theme={theme} />
code = code.replace(/(<PadTopAesthetics theme=\{theme\} \/>)/g, '$1\n        <PadBottomAesthetics theme={theme} />');

fs.writeFileSync('src/components/PadPreview.tsx', code);
