const fs = require('fs');
let code = fs.readFileSync('src/components/PadPreview.tsx', 'utf8');

const watermarkDef = `
  const logoWatermark = (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '120mm',
      height: '120mm',
      opacity: 0.05,
      zIndex: 1,
      pointerEvents: 'none'
    }} dangerouslySetInnerHTML={{ __html: mark }} />
  );
`;

// Insert after `const prim = theme.primary;` or somewhere inside PadPreview
code = code.replace(/const prim = theme\.primary;/, `const prim = theme.primary;\n${watermarkDef}`);

// Inject {logoWatermark} right after `<PadTopAesthetics theme={theme} />`
code = code.replace(/(<PadTopAesthetics theme=\{theme\} \/>)/g, '$1\n        {logoWatermark}');

fs.writeFileSync('src/components/PadPreview.tsx', code);
