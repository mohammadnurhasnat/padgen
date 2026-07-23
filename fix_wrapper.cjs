const fs = require('fs');

let content = fs.readFileSync('src/components/CardPreview.tsx', 'utf8');

// Rename CardPreview to CardPreviewInner
content = content.replace('export const CardPreview: React.FC<CardPreviewProps> = ({', 'const CardPreviewInner: React.FC<CardPreviewProps> = ({');

// Remove existing QR codes from Standard and Split layouts
// We'll just replace the whole QRComponent blocks or QRCodeSVG blocks with empty string.
content = content.replace(/<div style={{ background: 'white', padding: '1px', display: 'inline-block' }}>[\s\n]*<QRCodeSVG[\s\S]*?\/>[\s\n]*<\/div>/g, '');

// Append the new wrapper at the end
content += `

export const CardPreview: React.FC<CardPreviewProps> = (props) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CardPreviewInner {...props} />
      <div style={{ 
        position: 'absolute', 
        bottom: '4mm', 
        right: '4mm', 
        background: 'rgba(255, 255, 255, 0.9)', 
        padding: '1.5px', 
        borderRadius: '2px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <QRCodeSVG
          value={\`Name: \${props.data.empName}\\nDesignation: \${props.data.empRole}\\nPhone: \${props.data.empPhone || props.data.phone}\\nEmail: \${props.data.empEmail || props.data.email}\\nCompany: \${props.data.companyName}\\nAddress: \${props.data.address}\\nWebsite: \${props.data.tagline}\`}
          size={24}
          level="L"
        />
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/CardPreview.tsx.new', content);
