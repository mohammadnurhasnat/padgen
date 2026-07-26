import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Download, FileText, CreditCard, Shuffle } from 'lucide-react';
import { PadPreview } from './PadPreview';
import { CardPreview } from './CardPreview';
import { CompanyData, Theme } from '../types';
import { 
  HEADLINE_FONTS, 
  SHAPES, 
  GRID_STYLES, GRID_STYLE_LABELS,
  TEXTURES, TEXTURE_LABELS,
  CARD_LAYOUTS, CARD_LAYOUT_LABELS
} from '../data';

interface PreviewStageProps {
  companyData: CompanyData;
  theme: Theme;
  shape: string;
  padLayout: string;
  cardLayout: string;
  headlineFont: string;
  logoStyle: string;
  gridStyle: string;
  texture: string;
  previewPadRef: React.RefObject<HTMLDivElement | null>;
  previewCardRef: React.RefObject<HTMLDivElement | null>;
  uploadedLogo?: string;
  uploadedLogoSize?: number;
  uploadedLogoOpacity?: number;
  onUpdateStyle?: (key: 'font' | 'shape' | 'gridStyle' | 'texture' | 'cardLayout' | 'theme', value: string) => void;
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
  onUpdateStyle,
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

    // Dynamically calculate target width based on container width so it scales flexibly with screen width and browser zoom
    let targetPadWidth = 380;
    let targetCardWidth = 320;

    if (containerWidth >= 1200) {
      targetPadWidth = Math.min(540, Math.max(380, containerWidth * 0.38));
      targetCardWidth = Math.min(440, Math.max(320, containerWidth * 0.30));
    } else if (containerWidth < 900) {
      targetPadWidth = Math.min(380, Math.max(260, containerWidth - 32));
      targetCardWidth = Math.min(320, Math.max(240, containerWidth - 32));
    }

    setScales({
      padScale: targetPadWidth / padNaturalWidth,
      cardScale: targetCardWidth / cardNaturalWidth,
    });
  };

  useEffect(() => {
    updateScaling();
    window.addEventListener('resize', updateScaling);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => updateScaling());
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScaling);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [companyData]);

  const padHeight = 297 * mmToPx;
  const padWidth = 210 * mmToPx;
  const cardHeight = 51 * mmToPx;
  const cardWidth = 89 * mmToPx;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
      {/* SINGLE COMPACT TOP CONTROL BAR */}
      <div className="w-full bg-white border-b border-neutral-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs shrink-0 z-30">
        <div className="flex flex-wrap items-center gap-1.5">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-2.5 py-1.5 rounded-md text-[11px] cursor-pointer border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs transition-all flex items-center gap-1 lg:hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Edit</span>
            </button>
          )}

          {onRedesign && (
            <button
              onClick={onRedesign}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-md text-[11px] cursor-pointer border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-100 animate-spin-slow" />
              <span>Re-design</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-neutral-300 mx-0.5 hidden sm:block" />

          {/* Random Live Customization Buttons */}
          <button
            type="button"
            onClick={() => onUpdateStyle && onUpdateStyle('font', 'random')}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
          >
            <Shuffle className="w-3 h-3 text-amber-100" />
            <span>Font</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateStyle && onUpdateStyle('shape', 'random')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
          >
            <Shuffle className="w-3 h-3 text-indigo-100" />
            <span>Logo</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateStyle && onUpdateStyle('gridStyle', 'random')}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
          >
            <Shuffle className="w-3 h-3 text-violet-100" />
            <span>Grid/Lines</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateStyle && onUpdateStyle('texture', 'random')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
          >
            <Shuffle className="w-3 h-3 text-rose-100" />
            <span>Texture</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateStyle && onUpdateStyle('cardLayout', 'random')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
          >
            <Shuffle className="w-3 h-3 text-cyan-100" />
            <span>Card Format</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateStyle && onUpdateStyle('theme', 'random')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
          >
            <Shuffle className="w-3 h-3 text-blue-100" />
            <span>Theme</span>
          </button>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {onDownloadPadPDF && (
            <button
              onClick={onDownloadPadPDF}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
            >
              <Download className="w-3 h-3" />
              <span>Pad PDF</span>
            </button>
          )}
          {onDownloadCardPDF && (
            <button
              onClick={onDownloadCardPDF}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center gap-1 border-b-[2px] border-black/20 active:border-b-0 active:translate-y-[2px] shadow-xs"
            >
              <Download className="w-3 h-3" />
              <span>Card PDF</span>
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
