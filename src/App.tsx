import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { AnimatePresence, motion } from 'motion/react';

// Types & Data
import { CompanyData, DesignControls, HistoryItem } from './types';
import {
  THEMES,
  HEADLINE_FONTS,
  SHAPES,
  PAD_LAYOUTS,
  CARD_LAYOUTS,
  LOGO_STYLES,
  GRID_STYLES,
  TEXTURES,
  DEFAULT_COMPANY_DATA
} from './data';

// Component Imports
import { ControlPanel } from './components/ControlPanel';
import { PreviewStage } from './components/PreviewStage';
import { HistoryPanel } from './components/HistoryPanel';
import { OfficeIDCard } from './components/OfficeIDCard';
import { HeaderNavigation } from './components/HeaderNavigation';
import { CoverLetterGenerator } from './components/CoverLetterGenerator';
import { svgWrap, downloadBlob } from './utils';

export default function App() {
  // Navigation / Workspace tab state: 'designer' | 'cover-letter' | 'id-card'
  const [activeTab, setActiveTab] = useState<'designer' | 'cover-letter' | 'id-card'>('designer');
  const [designerStep, setDesignerStep] = useState<'form' | 'preview'>('form');

  // ------------------------------------------
  // Pad & Card Designer State
  // ------------------------------------------
  const [companyData, setCompanyData] = useState<CompanyData>(DEFAULT_COMPANY_DATA);
  const [controls, setControls] = useState<DesignControls>({
    font: 'random',
    shape: 'random',
    padLayout: 'random',
    cardLayout: 'random',
    logoStyle: 'random',
    gridStyle: 'random',
    texture: 'random',
  });

  // Resolved concrete preview choices
  const [themeIdx, setThemeIdx] = useState<number>(0);
  const [resolvedShape, setResolvedShape] = useState<typeof SHAPES[number]>('circle');
  const [resolvedPadLayout, setResolvedPadLayout] = useState<string>('canva-minimal-blue-gold');
  const [resolvedCardLayout, setResolvedCardLayout] = useState<string>('centered');
  const [resolvedFontIdx, setResolvedFontIdx] = useState<number>(0);
  const [resolvedLogoStyle, setResolvedLogoStyle] = useState<typeof LOGO_STYLES[number]>('classic');
  const [resolvedGridStyle, setResolvedGridStyle] = useState<typeof GRID_STYLES[number]>('none');
  const [resolvedTexture, setResolvedTexture] = useState<typeof TEXTURES[number]>('none');

  // Brand Logo upload properties
  const [uploadedLogo, setUploadedLogo] = useState<string>('');
  const [uploadedLogoSize, setUploadedLogoSize] = useState<number>(90);
  const [uploadedLogoOpacity, setUploadedLogoOpacity] = useState<number>(0.12);

  // Status & Error triggers
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Download states / History
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // DOM Refs for image rendering
  const previewPadRef = useRef<HTMLDivElement | null>(null);
  const previewCardRef = useRef<HTMLDivElement | null>(null);

  // Synchronize design customizer changes instantly (if not set to random)
  useEffect(() => {
    if (controls.font !== 'random') {
      setResolvedFontIdx(Number(controls.font));
    }
    if (controls.shape !== 'random') {
      setResolvedShape(controls.shape);
    }
    if (controls.padLayout !== 'random') {
      setResolvedPadLayout(controls.padLayout);
    }
    if (controls.cardLayout !== 'random') {
      setResolvedCardLayout(controls.cardLayout);
    }
    if (controls.logoStyle !== 'random') {
      setResolvedLogoStyle(controls.logoStyle);
    }
    if (controls.gridStyle !== 'random') {
      setResolvedGridStyle(controls.gridStyle);
    }
    if (controls.texture !== 'random') {
      setResolvedTexture(controls.texture);
    }
  }, [controls]);

  // Load history list on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('padgen_history');
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch {
      console.warn('Failed to load history list from localStorage.');
    }
  }, []);

  // Handle randomizer triggers
  const handleGenerateDesigner = () => {
    const randomTheme = Math.floor(Math.random() * THEMES.length);
    setThemeIdx(randomTheme);

    if (controls.font === 'random') {
      setResolvedFontIdx(Math.floor(Math.random() * HEADLINE_FONTS.length));
    }
    if (controls.shape === 'random') {
      setResolvedShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }
    if (controls.padLayout === 'random') {
      setResolvedPadLayout(PAD_LAYOUTS[Math.floor(Math.random() * PAD_LAYOUTS.length)]);
    }
    if (controls.cardLayout === 'random') {
      setResolvedCardLayout(CARD_LAYOUTS[Math.floor(Math.random() * CARD_LAYOUTS.length)]);
    }
    if (controls.logoStyle === 'random') {
      setResolvedLogoStyle(LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)]);
    }
    if (controls.gridStyle === 'random') {
      setResolvedGridStyle(GRID_STYLES[Math.floor(Math.random() * GRID_STYLES.length)]);
    }
    if (controls.texture === 'random') {
      setResolvedTexture(TEXTURES[Math.floor(Math.random() * TEXTURES.length)]);
    }

    setDesignerStep('preview');
    setStatus('Generated a beautiful new layout!');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleRandomTheme = () => {
    const randomTheme = Math.floor(Math.random() * THEMES.length);
    setThemeIdx(randomTheme);
    setStatus('New theme applied successfully!');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleResetInputs = () => {
    setCompanyData(DEFAULT_COMPANY_DATA);
    setStatus('Company details reset to default.');
    setTimeout(() => setStatus(null), 3000);
  };

  const appendDownloadHistory = (type: HistoryItem['type'], filename: string) => {
    const newItem: HistoryItem = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleString(),
      type,
      filename,
      data: companyData,
      theme: THEMES[themeIdx],
      shape: resolvedShape,
      padLayout: resolvedPadLayout,
      cardLayout: resolvedCardLayout,
      fontIdx: resolvedFontIdx,
      logoStyle: resolvedLogoStyle,
      gridStyle: resolvedGridStyle,
      texture: resolvedTexture,
    };
    const updated = [newItem, ...historyList];
    setHistoryList(updated);
    localStorage.setItem('padgen_history', JSON.stringify(updated));
  };

  const captureRenderElement = async (ref: React.RefObject<HTMLDivElement | null>, scale: number = 3) => {
    if (!ref.current) {
      throw new Error('Reference is not ready for image capture.');
    }
    return await htmlToImage.toPng(ref.current, { pixelRatio: scale });
  };

  // PDF and Image file downloader actions
  const handleDownloadPadPNG = async () => {
    try {
      setStatus('Capturing Letterhead Pad PNG...');
      const dataUrl = await captureRenderElement(previewPadRef, 3);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `letterhead_pad_${companyData.companyName.replace(/\s+/g, '_')}.png`;
      a.click();
      appendDownloadHistory('pad-png', `letterhead_pad_${companyData.companyName.replace(/\s+/g, '_')}.png`);
      setStatus('Downloaded Pad PNG successfully!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setError(`Export Error: ${err.message}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleDownloadCardPNG = async () => {
    try {
      setStatus('Capturing Visiting Card PNG...');
      const dataUrl = await captureRenderElement(previewCardRef, 4);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `visiting_card_${companyData.companyName.replace(/\s+/g, '_')}.png`;
      a.click();
      appendDownloadHistory('card-png', `visiting_card_${companyData.companyName.replace(/\s+/g, '_')}.png`);
      setStatus('Downloaded Visiting Card PNG!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setError(`Export Error: ${err.message}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleDownloadPadPDF = async () => {
    try {
      setStatus('Generating Pad PDF package...');
      const dataUrl = await captureRenderElement(previewPadRef, 2.5);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      doc.save(`letterhead_pad_${companyData.companyName.replace(/\s+/g, '_')}.pdf`);
      appendDownloadHistory('pad-pdf', `letterhead_pad_${companyData.companyName.replace(/\s+/g, '_')}.pdf`);
      setStatus('Pad PDF downloaded!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setError(`Export Error: ${err.message}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleDownloadCardPDF = async () => {
    try {
      setStatus('Generating Visiting Card PDF package...');
      const dataUrl = await captureRenderElement(previewCardRef, 3);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [89, 51] });
      doc.addImage(dataUrl, 'PNG', 0, 0, 89, 51);
      doc.save(`visiting_card_${companyData.companyName.replace(/\s+/g, '_')}.pdf`);
      appendDownloadHistory('card-pdf', `visiting_card_${companyData.companyName.replace(/\s+/g, '_')}.pdf`);
      setStatus('Visiting Card PDF downloaded!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setError(`Export Error: ${err.message}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleExportPadSVG = () => {
    if (previewPadRef.current) {
      const svgStr = svgWrap(previewPadRef.current.innerHTML, 210, 297);
      downloadBlob(svgStr, `letterhead_pad_${companyData.companyName.replace(/\s+/g, '_')}.svg`, 'image/svg+xml');
      appendDownloadHistory('pad-svg', `letterhead_pad_${companyData.companyName.replace(/\s+/g, '_')}.svg`);
      setStatus('Pad vector (SVG) exported!');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleExportCardSVG = () => {
    if (previewCardRef.current) {
      const svgStr = svgWrap(previewCardRef.current.innerHTML, 89, 51);
      downloadBlob(svgStr, `visiting_card_${companyData.companyName.replace(/\s+/g, '_')}.svg`, 'image/svg+xml');
      appendDownloadHistory('card-svg', `visiting_card_${companyData.companyName.replace(/\s+/g, '_')}.svg`);
      setStatus('Visiting Card vector (SVG) exported!');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleExportAI = () => {
    setStatus('Preparing vector resource layout package (.ai)...');
    setTimeout(() => {
      const payload = {
        app: 'PadGen Vector Creator',
        companyData,
        design: {
          theme: THEMES[themeIdx],
          shape: resolvedShape,
          padLayout: resolvedPadLayout,
          font: HEADLINE_FONTS[resolvedFontIdx],
        }
      };
      downloadBlob(JSON.stringify(payload, null, 2), `vector_${companyData.companyName.replace(/\s+/g, '_').toLowerCase()}.ai`, 'application/postscript');
      appendDownloadHistory('vector-ai', `vector_${companyData.companyName.replace(/\s+/g, '_').toLowerCase()}.ai`);
      setStatus('Illustrator Vector layout downloaded!');
    }, 500);
  };

  const handleExportPSD = () => {
    setStatus('Structuring layered photoshop container (.psd)...');
    setTimeout(() => {
      const payload = {
        app: 'PadGen Layers Package',
        companyData,
        layers: ['HeaderLogo', 'WatermarkIcon', 'RulesAndLines', 'FooterGrid']
      };
      downloadBlob(JSON.stringify(payload, null, 2), `photoshop_${companyData.companyName.replace(/\s+/g, '_').toLowerCase()}.psd`, 'image/vnd.adobe.photoshop');
      appendDownloadHistory('photoshop-psd', `photoshop_${companyData.companyName.replace(/\s+/g, '_').toLowerCase()}.psd`);
      setStatus('Photoshop layout container exported!');
    }, 500);
  };

  const handleSaveLocalTemplate = () => {
    const payload = {
      data: companyData,
      theme: THEMES[themeIdx],
      shape: resolvedShape,
      padLayout: resolvedPadLayout,
      cardLayout: resolvedCardLayout,
      fontIdx: resolvedFontIdx,
      logoStyle: resolvedLogoStyle,
      gridStyle: resolvedGridStyle,
      texture: resolvedTexture,
    };
    downloadBlob(JSON.stringify(payload, null, 2), `template_${companyData.companyName.replace(/\s+/g, '_').toLowerCase()}.json`, 'application/json');
    setStatus('Bespoke JSON template downloaded!');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleLoadLocalTemplate = (payload: any) => {
    if (payload && payload.data) {
      setCompanyData(payload.data);
      if (payload.theme) {
        const idx = THEMES.findIndex(t => t.name === payload.theme.name);
        if (idx !== -1) setThemeIdx(idx);
      }
      if (payload.shape) {
        setControls(prev => ({ ...prev, shape: payload.shape }));
        setResolvedShape(payload.shape);
      }
      if (payload.padLayout) {
        setControls(prev => ({ ...prev, padLayout: payload.padLayout }));
        setResolvedPadLayout(payload.padLayout);
      }
      if (payload.cardLayout) {
        setControls(prev => ({ ...prev, cardLayout: payload.cardLayout }));
        setResolvedCardLayout(payload.cardLayout);
      }
      if (payload.fontIdx !== undefined) {
        setControls(prev => ({ ...prev, font: String(payload.fontIdx) }));
        setResolvedFontIdx(payload.fontIdx);
      }
      if (payload.logoStyle) {
        setControls(prev => ({ ...prev, logoStyle: payload.logoStyle }));
        setResolvedLogoStyle(payload.logoStyle);
      }
      if (payload.gridStyle) {
        setControls(prev => ({ ...prev, gridStyle: payload.gridStyle }));
        setResolvedGridStyle(payload.gridStyle);
      }
      if (payload.texture) {
        setControls(prev => ({ ...prev, texture: payload.texture }));
        setResolvedTexture(payload.texture);
      }
      setStatus('State loaded successfully!');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setCompanyData(item.data);
    const themeIndex = THEMES.findIndex(t => t.name === item.theme.name);
    if (themeIndex !== -1) setThemeIdx(themeIndex);
    setResolvedShape(item.shape);
    setResolvedPadLayout(item.padLayout);
    setResolvedCardLayout(item.cardLayout);
    setResolvedFontIdx(item.fontIdx);
    setResolvedLogoStyle(item.logoStyle);
    setResolvedGridStyle(item.gridStyle);
    setResolvedTexture(item.texture);
    setStatus('History template loaded.');
    setIsHistoryOpen(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDownloadHistoryItemAgain = (item: HistoryItem) => {
    handleLoadHistoryItem(item);
    setTimeout(() => {
      if (item.type === 'pad-pdf') handleDownloadPadPDF();
      else if (item.type === 'card-pdf') handleDownloadCardPDF();
      else if (item.type === 'pad-png') handleDownloadPadPNG();
      else if (item.type === 'card-png') handleDownloadCardPNG();
    }, 500);
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem('padgen_history');
    setStatus('History cleared.');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const filtered = historyList.filter(item => item.id !== id);
    setHistoryList(filtered);
    localStorage.setItem('padgen_history', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-white text-neutral-800 transition-colors duration-200">
      {/* Top Navigation Header */}
      <HeaderNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto py-1 print:py-0">
        <AnimatePresence mode="wait">
          {/* TAB 1: PAD & CARD DESIGNER */}
          {activeTab === 'designer' && (
            <motion.div
              key="designer-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col md:flex-row h-[calc(100vh-65px)] overflow-hidden"
            >
              {designerStep === 'form' && (
                <ControlPanel
                  companyData={companyData}
                  onDataChange={setCompanyData}
                  controls={controls}
                  onControlsChange={setControls}
                  onGenerate={handleGenerateDesigner}
                  onRandomTheme={handleRandomTheme}
                  onResetAll={handleResetInputs}
                  onDownloadPadPDF={handleDownloadPadPDF}
                  onDownloadCardPDF={handleDownloadCardPDF}
                  onExportCardSVG={handleExportCardSVG}
                  onExportPadSVG={handleExportPadSVG}
                  onDownloadCardPNG={handleDownloadCardPNG}
                  onDownloadPadPNG={handleDownloadPadPNG}
                  onExportAI={handleExportAI}
                  onExportPSD={handleExportPSD}
                  onSaveTemplate={handleSaveLocalTemplate}
                  onLoadTemplate={handleLoadLocalTemplate}
                  error={error}
                  status={status}
                  onOpenHistory={() => setIsHistoryOpen(true)}
                  historyCount={historyList.length}
                  uploadedLogo={uploadedLogo}
                  onUploadedLogoChange={setUploadedLogo}
                  uploadedLogoSize={uploadedLogoSize}
                  onUploadedLogoSizeChange={setUploadedLogoSize}
                  uploadedLogoOpacity={uploadedLogoOpacity}
                  onUploadedLogoOpacityChange={setUploadedLogoOpacity}
                />
              )}

              <PreviewStage
                companyData={companyData}
                theme={THEMES[themeIdx]}
                shape={resolvedShape}
                padLayout={resolvedPadLayout}
                cardLayout={resolvedCardLayout}
                headlineFont={HEADLINE_FONTS[resolvedFontIdx].stack}
                logoStyle={resolvedLogoStyle}
                gridStyle={resolvedGridStyle}
                texture={resolvedTexture}
                previewPadRef={previewPadRef}
                previewCardRef={previewCardRef}
                uploadedLogo={uploadedLogo}
                uploadedLogoSize={uploadedLogoSize}
                uploadedLogoOpacity={uploadedLogoOpacity}
                onBack={designerStep === 'preview' ? () => setDesignerStep('form') : undefined}
                onRedesign={handleGenerateDesigner}
                onDownloadPadPDF={handleDownloadPadPDF}
                onDownloadCardPDF={handleDownloadCardPDF}
                onDownloadPadPNG={handleDownloadPadPNG}
                onDownloadCardPNG={handleDownloadCardPNG}
              />

              <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                historyList={historyList}
                onLoadItem={handleLoadHistoryItem}
                onDownloadItemAgain={handleDownloadHistoryItemAgain}
                onClearHistory={handleClearHistory}
                onDeleteItem={handleDeleteHistoryItem}
              />
            </motion.div>
          )}

          {/* TAB 2: COVER LETTER GENERATOR */}
          {activeTab === 'cover-letter' && (
            <CoverLetterGenerator
              companyData={companyData}
              setCompanyData={setCompanyData}
              theme={THEMES[themeIdx]}
            />
          )}

          {/* TAB 3: OFFICE ID CARD GENERATOR */}
          {activeTab === 'id-card' && (
            <motion.div
              key="id-card-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <OfficeIDCard
                companyData={companyData}
                onDataChange={setCompanyData}
                uploadedLogo={uploadedLogo}
                theme={THEMES[themeIdx]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
