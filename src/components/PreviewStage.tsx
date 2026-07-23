import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Download, FileText, CreditCard } from 'lucide-react';
import { PadPreview } from './PadPreview';
import { CardPreview } from './CardPreview';
import { CompanyData, Theme } from '../types';

interface PreviewStageProps {
  companyData: CompanyData;
  theme: Theme;
  shape: 'circle' | 'square' | 'hexagon' | 'diamond' | 'shield' | 'octagon' | 'star' | 'rhombus' | 'cross' | 'ellipse' | 'badge-ribbon' | 'waves' | 'emblem-shield';
  padLayout: any;
  cardLayout: any;
  headlineFont: string;
  logoStyle: 'classic' | 'typographic' | 'bordered' | 'shadow-badge';
  gridStyle: 'none' | 'dots' | 'lines';
  texture: 'none' | 'linen' | 'vellum' | 'canvas';
  previewPadRef: React.RefObject<HTMLDivElement | null>;
  previewCardRef: React.RefObject<HTMLDivElement | null>;
  uploadedLogo?: string;
  uploadedLogoSize?: number;
  uploadedLogoOpacity?: number;
  onBack?: () => void;
  onRedesign?: () => void;
  onDownloadPadPDF?: () => void;
  onDownloadCardPDF?: () => void;
  onDownloadPadPNG?: () => void;
  onDownloadCardPNG?: () => void;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  companyData,
  theme,
  shape,
  padLayout,
  cardLayout,
  headlineFont,
  logoStyle,
  gridStyle,
  texture,
  previewPadRef,
  previewCardRef,
  uploadedLogo,
  uploadedLogoSize,
  uploadedLogoOpacity,
  onBack,
  onRedesign,
  onDownloadPadPDF,
  onDownloadCardPDF,
  onDownloadPadPNG,
  onDownloadCardPNG,
}) => {
  const [scales, setScales] = useState({ padScale: 0.48, cardScale: 0.95 });
  const containerRef = useRef<HTMLDivElement>(null);

  const mmToPx = 96 / 25.4;
  const padNaturalWidth = 210 * mmToPx;
  const cardNaturalWidth = 89 * mmToPx;

  const updateScaling = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;

    // Default targets from original script
    let targetPadWidth = 380;
    let targetCardWidth = 320;

    // Adjust for smaller responsive screens
    if (containerWidth < 900) {
      targetPadWidth = Math.min(380, containerWidth - 40);
      targetCardWidth = Math.min(320, containerWidth - 40);
    }

    setScales({
      padScale: targetPadWidth / padNaturalWidth,
      cardScale: targetCardWidth / cardNaturalWidth,
    });
  };

  useEffect(() => {
    updateScaling();
    window.addEventListener('resize', updateScaling);
    return () => window.removeEventListener('resize', updateScaling);
  }, [companyData]);

  const padHeight = 297 * mmToPx;
  const padWidth = 210 * mmToPx;
  const cardHeight = 51 * mmToPx;
  const cardWidth = 89 * mmToPx;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
      {/* PREVIEW TOP CONTROL BAR (Back, Re-design, Downloads) */}
      <div className="w-full bg-white border-b border-neutral-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Edit</span>
            </button>
          )}

          {onRedesign && (
            <button
              onClick={onRedesign}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4 text-emerald-100 animate-spin-slow" />
              <span>Re-design</span>
            </button>
          )}
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onDownloadPadPDF && (
            <button
              onClick={onDownloadPadPDF}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pad PDF</span>
            </button>
          )}
          {onDownloadCardPDF && (
            <button
              onClick={onDownloadCardPDF}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Card PDF</span>
            </button>
          )}
          {onDownloadPadPNG && (
            <button
              onClick={onDownloadPadPNG}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pad PNG</span>
            </button>
          )}
          {onDownloadCardPNG && (
            <button
              onClick={onDownloadCardPNG}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Card PNG</span>
            </button>
          )}
        </div>
      </div>

      {/* PREVIEW STAGE CANVAS */}
      <div
        ref={containerRef}
        id="stage"
        className="flex-1 p-6 md:p-12 overflow-auto flex justify-center items-start transition-colors duration-200"
        style={{
          background: 'radial-gradient(circle at center, #FFFFFF 0%, #F1F5F9 100%)',
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.02)',
        }}
      >
      <div className="flex gap-12 justify-center items-start flex-wrap py-4">
        {/* Pad (A4) Preview Frame */}
        <div className="flex flex-col items-center">
          <div
            className="origin-top-left transition-transform duration-100 relative"
            style={{
              width: '210mm',
              height: '297mm',
              transform: `scale(${scales.padScale})`,
              marginBottom: `-${(1 - scales.padScale) * padHeight}px`,
              marginRight: `-${(1 - scales.padScale) * padWidth}px`,
            }}
          >
            {/* Background page stack effect for physical realism */}
            <div style={{
              position: 'absolute',
              top: '1.2mm',
              left: '1.5mm',
              width: '210mm',
              height: '297mm',
              backgroundColor: '#EAE9E5',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              transform: 'rotate(0.6deg)',
              zIndex: 1,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              top: '0.6mm',
              left: '0.8mm',
              width: '210mm',
              height: '297mm',
              backgroundColor: '#F5F4F0',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transform: 'rotate(-0.4deg)',
              zIndex: 2,
              pointerEvents: 'none',
            }} />

            {/* Top heavy binding strip for real paper block look */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8mm',
              background: 'linear-gradient(180deg, #2D2E30 0%, #151617 100%)',
              borderBottom: '1px solid #000',
              boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              zIndex: 25,
              borderTopLeftRadius: '2px',
              borderTopRightRadius: '2px',
            }}>
              {/* Gold/Copper Staples */}
              <div style={{ position: 'absolute', left: '25%', top: '2.5mm', width: '10mm', height: '1.2mm', background: 'linear-gradient(180deg, #D4AF37 0%, #AA7C11 100%)', borderRadius: '0.5px', border: '0.5px solid #885F00' }}></div>
              <div style={{ position: 'absolute', right: '25%', top: '2.5mm', width: '10mm', height: '1.2mm', background: 'linear-gradient(180deg, #D4AF37 0%, #AA7C11 100%)', borderRadius: '0.5px', border: '0.5px solid #885F00' }}></div>
              {/* Micro-perforation line */}
              <div style={{ position: 'absolute', bottom: '-2mm', left: 0, right: 0, height: '1px', borderBottom: '1.2px dashed rgba(0,0,0,0.15)', zIndex: 19 }}></div>
            </div>

            <div ref={previewPadRef} style={{ position: 'relative', zIndex: 10, boxShadow: '0 12px 38px rgba(0,0,0,0.18)', borderRadius: '2px', overflow: 'hidden' }}>
              <PadPreview
                data={companyData}
                theme={theme}
                shape={shape}
                layout={padLayout}
                headlineFont={headlineFont}
                logoStyle={logoStyle}
                gridStyle={gridStyle}
                texture={texture}
                uploadedLogo={uploadedLogo}
                uploadedLogoSize={uploadedLogoSize}
                uploadedLogoOpacity={uploadedLogoOpacity}
              />
            </div>
          </div>
          <div className="font-mono text-[10.5px] text-[#6B7076] mt-4 tracking-wider select-none">
            A4 · 210 × 297mm
          </div>
        </div>

        {/* Business Visiting Card Preview Frame */}
        <div className="flex flex-col items-center">
          <div
            className="origin-top-left transition-transform duration-100 relative"
            style={{
              width: '89mm',
              height: '51mm',
              transform: `scale(${scales.cardScale})`,
              marginBottom: `-${(1 - scales.cardScale) * cardHeight}px`,
              marginRight: `-${(1 - scales.cardScale) * cardWidth}px`,
            }}
          >
            {/* Background stack layer 2 */}
            <div style={{
              position: 'absolute',
              top: '0.9mm',
              left: '1.3mm',
              width: '89mm',
              height: '51mm',
              backgroundColor: theme.paper === '#FFFFFF' ? '#F6F6F6' : theme.paper,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transform: 'rotate(1.5deg)',
              zIndex: 1,
              pointerEvents: 'none',
              borderRadius: '2.5px',
            }} />
            
            {/* Background stack layer 1 */}
            <div style={{
              position: 'absolute',
              top: '0.4mm',
              left: '0.6mm',
              width: '89mm',
              height: '51mm',
              backgroundColor: theme.paper === '#FFFFFF' ? '#FAF9F6' : theme.paper,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
              transform: 'rotate(-1.2deg)',
              zIndex: 2,
              pointerEvents: 'none',
              borderRadius: '2.5px',
            }} />

            <div ref={previewCardRef} style={{ position: 'relative', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.22)', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.07)' }}>
              <CardPreview
                data={companyData}
                theme={theme}
                shape={shape}
                layout={cardLayout}
                headlineFont={headlineFont}
                logoStyle={logoStyle}
                texture={texture}
                uploadedLogo={uploadedLogo}
              />
            </div>
          </div>
          <div className="font-mono text-[10.5px] text-[#6B7076] mt-4 tracking-wider select-none">
            Business Card · 89 × 51mm
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
