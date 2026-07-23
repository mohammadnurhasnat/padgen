import React from 'react';
import { CompanyData, Theme } from '../types';
import { getInitials, logoMarkSVG, hexToRgba, nameFontSize, formatCompanyName, getTextureStyles, getGridStyles } from '../utils';

interface PadPreviewProps {
  data: CompanyData;
  theme: Theme;
  shape: any;
  layout: any;
  headlineFont: string;
  logoStyle: any;
  gridStyle?: any;
  texture?: any;
  uploadedLogo?: string;
  uploadedLogoSize?: number;
  uploadedLogoOpacity?: number;
}

const PadPreviewInner: React.FC<PadPreviewProps> = ({
  data,
  theme,
  shape,
  layout,
  headlineFont,
  logoStyle,
  gridStyle = 'none',
  texture = 'none',
  uploadedLogo,
  uploadedLogoSize = 90,
  uploadedLogoOpacity = 0.12,
}) => {
  const initials = getInitials(data.companyName);
  
  // Enforce sophisticated, classic, non-colorful tones
  const isDarkTheme = theme.primary === '#0B192C'; // support tech-dark paper
  const customPaper = isDarkTheme ? '#0F172A' : '#FCFCFC';
  
  // Muted classic colors
  const prim = isDarkTheme ? '#E2E8F0' : '#1E293B'; // Deep Slate or Off-white
  const acc = '#C5A880'; // Classic Antique Gold
  const sec = '#64748B'; // Muted Slate Grey
  const detailsMuted = isDarkTheme ? '#94A3B8' : '#475569';

  const mark = logoMarkSVG(initials, shape, prim, acc, isDarkTheme ? '#0F172A' : '#FFFFFF', logoStyle);

  const waterMark = (
    <div
      className="wm"
      style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: uploadedLogo ? `${uploadedLogoSize}mm` : '90mm',
        height: uploadedLogo ? `${uploadedLogoSize}mm` : '90mm',
        opacity: uploadedLogo ? uploadedLogoOpacity : 0.06,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {uploadedLogo ? (
        <img
          src={uploadedLogo}
          alt="Company Watermark Logo"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          style={{ width: '100%', height: '100%', filter: isDarkTheme ? 'invert(1)' : 'none' }}
          dangerouslySetInnerHTML={{ __html: mark }}
        />
      )}
    </div>
  );

  const backgroundGridStyles = getGridStyles(gridStyle, prim, headlineFont, data.companyName);
  const nameSize = Math.max(22, Math.min(30, nameFontSize(data.companyName) + 8));

  // Shared classic header rendering function to guarantee exact format, ordering, and 2.5/14 parts height constraint
  const renderClassicHeader = (lineColor: string = acc) => {
    return (
      <>
        {/* Header content box: exactly 53mm tall (2.5 out of 14 parts of the 297mm page height) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '53mm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '6mm 10mm 1mm 10mm',
          boxSizing: 'border-box',
          zIndex: 10,
        }}>
          {/* Company Name in CAPITAL letters, directly in the middle */}
          <div style={{
            fontFamily: headlineFont,
            fontSize: `${nameSize}pt`,
            fontWeight: 'bold',
            color: prim,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            marginBottom: '3mm',
            textAlign: 'center',
          }}>
            {data.companyName.toUpperCase()}
          </div>

          {/* Address followed by a period */}
          <div style={{
            fontFamily: headlineFont,
            fontSize: '12.5pt',
            color: detailsMuted,
            fontWeight: 500,
            marginBottom: '1.5mm',
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
            {data.address}.
          </div>

          {/* Mobile number preceded by "Mobile" */}
          <div style={{
            fontFamily: headlineFont,
            fontSize: '12.5pt',
            color: detailsMuted,
            fontWeight: 500,
            marginBottom: '1.5mm',
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
            Mobile: {data.phone}
          </div>

          {/* Email address preceded by "Email" */}
          <div style={{
            fontFamily: headlineFont,
            fontSize: '12.5pt',
            color: detailsMuted,
            fontWeight: 500,
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
            Email: {data.email}
          </div>
        </div>

        {/* Horizontal line extending from the left side to the right side at exactly 53mm (the 2.5/14 parts mark) */}
        <div style={{
          position: 'absolute',
          top: '53mm',
          left: 0,
          right: 0,
          height: '1.5px',
          background: lineColor,
          zIndex: 10,
        }} />
      </>
    );
  };

  // 1. Classic Gold & Navy Center
  if (layout === 'canva-minimal-blue-gold') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Georgia', serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}
        
        {/* Standardized Classic Header */}
        {renderClassicHeader(acc)}

        {/* Clean classic bottom footer */}
        <div style={{ position: 'absolute', bottom: '12mm', left: '15mm', right: '15mm', borderTop: `1px solid ${hexToRgba(prim, 0.1)}`, paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: detailsMuted }}>
          <div>{data.companyName.toUpperCase()} &copy; 2026</div>
          <div style={{ display: 'flex', gap: '3mm' }}>
            <span>Ph: {data.phone}</span>
            <span>&bull;</span>
            <span>Email: {data.email}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Royal Heritage Monogram
  if (layout === 'canva-creative-corporate') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Times New Roman', serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Minimal classic corner frames */}
        <div style={{ position: 'absolute', top: '6mm', left: '6mm', width: '15mm', height: '15mm', borderTop: `1.5px solid ${acc}`, borderLeft: `1.5px solid ${acc}` }}></div>
        <div style={{ position: 'absolute', top: '6mm', right: '6mm', width: '15mm', height: '15mm', borderTop: `1.5px solid ${acc}`, borderRight: `1.5px solid ${acc}` }}></div>

        {/* Standardized Classic Header */}
        {renderClassicHeader(acc)}

        {/* Clean minimal footer */}
        <div style={{ position: 'absolute', bottom: '12mm', left: '15mm', right: '15mm', borderTop: `1px solid ${hexToRgba(prim, 0.08)}`, paddingTop: '4mm', textAlign: 'center', fontSize: '8.5pt', color: detailsMuted, letterSpacing: '1px' }}>
          {data.companyName.toUpperCase()} &bull; CONFIDENTIAL DOCUMENT
        </div>
      </div>
    );
  }

  // 3. Executive Thin Slate Border
  if (layout === 'canva-medical-clean') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Segoe UI', Arial, sans-serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Inset elegant border framing the letterhead */}
        <div style={{ position: 'absolute', top: '8mm', left: '8mm', right: '8mm', bottom: '8mm', border: `1px solid ${sec}`, opacity: 0.35, pointerEvents: 'none' }}></div>

        {/* Standardized Classic Header */}
        {renderClassicHeader(sec)}

        {/* Executive elegant footer */}
        <div style={{ position: 'absolute', bottom: '12mm', left: '15mm', right: '15mm', display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: detailsMuted }}>
          <div>{data.companyName.toUpperCase()}</div>
          <div>DATE: __________________</div>
        </div>
      </div>
    );
  }

  // 4. Traditional Law Chambers
  if (layout === 'canva-bold-finance') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Cambria', Georgia, serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Standardized Classic Header */}
        {renderClassicHeader(prim)}

        {/* Traditional Chambers Bottom Borders */}
        <div style={{ position: 'absolute', bottom: '15mm', left: '15mm', right: '15mm', borderTop: `1.5px solid ${prim}`, paddingTop: '3mm', display: 'flex', justifyContent: 'center', fontSize: '8.5pt', color: detailsMuted, letterSpacing: '1px' }}>
          {data.companyName.toUpperCase()} &copy; 2026 &bull; ALL RIGHTS RESERVED
        </div>
      </div>
    );
  }

  // 5. Bespoke Luxury Centered
  if (layout === 'canva-organic-abstract') {
    return (
      <div className="pad" style={{ background: isDarkTheme ? '#0F172A' : '#FAF8F5', fontFamily: "'Garamond', serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Subtle classic header frame */}
        <div style={{ position: 'absolute', top: '10mm', left: '10mm', right: '10mm', bottom: '10mm', border: `1px solid ${acc}`, opacity: 0.25, pointerEvents: 'none' }}></div>

        {/* Standardized Classic Header */}
        {renderClassicHeader(acc)}

        <div style={{ position: 'absolute', bottom: '14mm', left: '15mm', right: '15mm', textAlign: 'center', fontSize: '9pt', color: detailsMuted, letterSpacing: '2px' }}>
          ESTABLISHED 2026 &bull; {data.companyName.toUpperCase()}
        </div>
      </div>
    );
  }

  // 6. Modern Architectural Grid
  if (layout === 'canva-bento-modular') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Courier New', Courier, monospace", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Drafting marks in corners */}
        <div style={{ position: 'absolute', top: '8mm', left: '8mm', fontSize: '8pt', color: sec, opacity: 0.5 }}>[X_01]</div>
        <div style={{ position: 'absolute', top: '8mm', right: '8mm', fontSize: '8pt', color: sec, opacity: 0.5 }}>[Y_01]</div>

        {/* Standardized Classic Header */}
        {renderClassicHeader(sec)}

        <div style={{ position: 'absolute', bottom: '12mm', left: '15mm', right: '15mm', display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: detailsMuted }}>
          <div>SEC_DOC_REF_2026 // {data.companyName.toUpperCase()}</div>
          <div>PAGE 01/01</div>
        </div>
      </div>
    );
  }

  // 7. Vintage Charcoal Frame
  if (layout === 'canva-editorial-luxury') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Palatino', serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Heavy triple border framing style */}
        <div style={{ position: 'absolute', top: '8mm', left: '8mm', right: '8mm', bottom: '8mm', border: `1.5px solid ${prim}`, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '9.5mm', left: '9.5mm', right: '9.5mm', bottom: '9.5mm', border: `0.5px solid ${acc}`, pointerEvents: 'none' }}></div>

        {/* Standardized Classic Header */}
        {renderClassicHeader(acc)}

        <div style={{ position: 'absolute', bottom: '14mm', left: '15mm', right: '15mm', textAlign: 'center', fontSize: '9pt', color: detailsMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Private Stationery of {data.companyName}
        </div>
      </div>
    );
  }

  // 8. Minimalist Fine Line
  if (layout === 'canva-colorful-playful') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Segoe UI', Arial, sans-serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Standardized Classic Header */}
        {renderClassicHeader(prim)}

        <div style={{ position: 'absolute', bottom: '12mm', left: '15mm', right: '15mm', borderTop: `1px solid ${hexToRgba(prim, 0.08)}`, paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: detailsMuted }}>
          <div>{data.companyName.toUpperCase()}</div>
          <div>info@ {data.companyName.toLowerCase().replace(/\s+/g, '')}.com</div>
        </div>
      </div>
    );
  }

  // 9. Premium Institutional Seal
  if (layout === 'canva-tech-isometric') {
    return (
      <div className="pad" style={{ background: customPaper, fontFamily: "'Cinzel', 'Times New Roman', serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
        {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
        {waterMark}

        {/* Standardized Classic Header */}
        {renderClassicHeader(prim)}

        <div style={{ position: 'absolute', bottom: '12mm', left: '15mm', right: '15mm', borderTop: `1px solid ${prim}`, paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: detailsMuted, letterSpacing: '1.5px' }}>
          <span>INSTITUTIONAL DOCUMENT</span>
          <span>EST. 2026</span>
        </div>
      </div>
    );
  }

  // Fallback layout conforming strictly to format
  return (
    <div className="pad" style={{ background: customPaper, fontFamily: "'Segoe UI', Arial, sans-serif", border: `1px solid ${hexToRgba(prim, 0.08)}` }}>
      {gridStyle !== 'none' && <div style={backgroundGridStyles}></div>}
      {waterMark}
      
      {/* Standardized Classic Header */}
      {renderClassicHeader(acc)}
    </div>
  );
};

export const PadPreview: React.FC<PadPreviewProps> = (props) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <PadPreviewInner {...props} />
      {props.texture && props.texture !== 'none' && (
        <div style={{ ...getTextureStyles(props.texture), position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: 'none' }} />
      )}
    </div>
  );
};
