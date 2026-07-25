import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { CompanyData, Theme, HistoryItem } from '../types';
import { DEMO_COMPANY_DATA } from '../data';
import { Sparkles, ArrowLeft, Download, History, Palette, Sliders, Check, Maximize2, RefreshCw } from 'lucide-react';

interface JobIDCardProps {
  companyData: CompanyData;
  onDataChange: (data: CompanyData) => void;
  uploadedLogo: string;
  theme: Theme;
  onSaveHistory?: (item: HistoryItem) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  lastLoadedItem?: HistoryItem | null;
}

export type IDCardStyle = 'classic' | 'modern' | 'tech' | 'curved' | 'minimal';

export const CARD_STYLES: { id: IDCardStyle; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic Corporate', desc: 'Standard header bar & clean layout' },
  { id: 'modern', name: 'Modern Stripe', desc: 'Dual accent stripe with rounded photo' },
  { id: 'curved', name: 'Curved Wave', desc: 'Curved color frame & metallic accent' },
  { id: 'minimal', name: 'Minimal Executive', desc: 'Clean border & prominent typography' },
];

export const JobIDCard: React.FC<JobIDCardProps> = ({
  companyData,
  onDataChange,
  uploadedLogo,
  theme,
  onSaveHistory,
  onOpenHistory,
  historyCount = 0,
  lastLoadedItem,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [cardStyle, setCardStyle] = useState<IDCardStyle>('classic');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [previewScale, setPreviewScale] = useState(0.5);

  // Restore fields when a history item is loaded
  useEffect(() => {
    if (lastLoadedItem && lastLoadedItem.section === 'id-card') {
      if (lastLoadedItem.idOrientation) setOrientation(lastLoadedItem.idOrientation);
      if (lastLoadedItem.data) onDataChange(lastLoadedItem.data);
      setStep('preview');
    }
  }, [lastLoadedItem]);

  // Photo Fitting and Auto-Adjustment states
  const [photoFitMode, setPhotoFitMode] = useState<'cover' | 'contain'>('cover');
  const [photoAutoEnhanced, setPhotoAutoEnhanced] = useState<boolean>(false);
  const [photoBgColor, setPhotoBgColor] = useState<string>('#ffffff');
  const [showPhotoControls, setShowPhotoControls] = useState<boolean>(false);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      if (width < 640) setPreviewScale(0.25);
      else if (width < 1024) setPreviewScale(0.4);
      else setPreviewScale(0.5);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleFieldChange = (field: keyof CompanyData, value: string) => {
    onDataChange({
      ...companyData,
      [field]: value,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          handleFieldChange('empPhoto', evt.target.result as string);
          // Default normal photo placement on upload
          setPhotoFitMode('contain');
          setPhotoAutoEnhanced(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const cycleCardStyle = () => {
    const currentIndex = CARD_STYLES.findIndex((s) => s.id === cardStyle);
    const nextIndex = (currentIndex + 1) % CARD_STYLES.length;
    setCardStyle(CARD_STYLES[nextIndex].id);
  };

  const handleDownloadPNG = async (side: 'front' | 'back' | 'both') => {
    setIsExporting(true);
    try {
      if ((side === 'front' || side === 'both') && frontCardRef.current) {
        const dataUrl = await htmlToImage.toPng(frontCardRef.current, { pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `${companyData.companyName || 'Company'}_ID_Card_Front.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      if ((side === 'back' || side === 'both') && backCardRef.current) {
        const dataUrl = await htmlToImage.toPng(backCardRef.current, { pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `${companyData.companyName || 'Company'}_ID_Card_Back.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error generating PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadA4PDF = async () => {
    setIsExporting(true);
    try {
      if (!frontCardRef.current || !backCardRef.current) return;

      const frontDataUrl = await htmlToImage.toPng(frontCardRef.current, { pixelRatio: 3 });
      const backDataUrl = await htmlToImage.toPng(backCardRef.current, { pixelRatio: 3 });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const cardW = orientation === 'horizontal' ? 85.6 : 54;
      const cardH = orientation === 'horizontal' ? 54 : 85.6;

      const spaceBetween = 15;
      const totalHeight = (cardH * 2) + spaceBetween;
      const startY = (297 - totalHeight) / 2;
      const startX = (210 - cardW) / 2;

      pdf.setDrawColor(200, 200, 200);

      pdf.addImage(frontDataUrl, 'PNG', startX, startY, cardW, cardH);
      pdf.rect(startX, startY, cardW, cardH);

      const backY = startY + cardH + spaceBetween;
      pdf.addImage(backDataUrl, 'PNG', startX, backY, cardW, cardH);
      pdf.rect(startX, backY, cardW, cardH);

      const filename = `${companyData.companyName || DEMO_COMPANY_DATA.companyName}_Job_ID_Card_A4.pdf`;
      pdf.save(filename);

      if (onSaveHistory) {
        onSaveHistory({
          id: 'id-card-' + Date.now(),
          timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ''),
          section: 'id-card',
          title: companyData.empName || companyData.companyName || 'Job ID Card',
          type: 'id-card-pdf',
          filename: filename,
          data: { ...companyData },
          idOrientation: orientation,
        });
      }
    } catch (err) {
      console.error('Error generating A4 PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const primaryColor = theme.primary || '#064E3B';
  const accentColor = theme.accent || '#D4AF37';
  const secondaryColor = theme.secondary || '#0F766E';

  const currentStyleObj = CARD_STYLES.find((s) => s.id === cardStyle) || CARD_STYLES[0];

  const photoFilterStyle = photoAutoEnhanced
    ? 'contrast(1.08) brightness(1.03) saturate(1.06)'
    : 'none';

  return (
    <div className="w-full flex flex-col gap-6 py-4 px-2 sm:px-6 max-w-7xl mx-auto min-h-screen">
      {step === 'form' ? (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                Job ID Card Generator
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Fill in employee details and customize photo framing & layout style.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  className="bg-amber-500 hover:bg-amber-400 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                  {historyCount > 0 && (
                    <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                      {historyCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => photoInputRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Upload Photo
              </button>

              {companyData.empPhoto && (
                <button
                  onClick={() => handleFieldChange('empPhoto', '')}
                  className="bg-rose-600 hover:bg-rose-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Remove Photo
                </button>
              )}

              <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Company Name</label>
              <input
                type="text"
                value={companyData.companyName || ''}
                onChange={(e) => handleFieldChange('companyName', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.companyName}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Employee Name</label>
              <input
                type="text"
                value={companyData.empName || ''}
                onChange={(e) => handleFieldChange('empName', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.empName}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Designation</label>
              <input
                type="text"
                value={companyData.empRole || ''}
                onChange={(e) => handleFieldChange('empRole', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.empRole}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">ID / Badge Number</label>
              <input
                type="text"
                value={companyData.empIdNumber || ''}
                onChange={(e) => handleFieldChange('empIdNumber', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.empIdNumber}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Employee Mobile</label>
              <input
                type="text"
                value={companyData.empPhone || ''}
                onChange={(e) => handleFieldChange('empPhone', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.empPhone}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Employee Email</label>
              <input
                type="email"
                value={companyData.empEmail || ''}
                onChange={(e) => handleFieldChange('empEmail', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.empEmail}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Company Address</label>
              <input
                type="text"
                value={companyData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder={DEMO_COMPANY_DATA.address}
                className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 mt-2">
            <button
              onClick={() => setStep('preview')}
              className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-black py-3 px-6 rounded-xl text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Design
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top Control Bar in Preview mode */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Back Button */}
              <button
                onClick={() => setStep('form')}
                className="bg-white hover:bg-neutral-100 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-neutral-800 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-300"
                title="Back to Edit Form"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Back</span>
              </button>

              {/* Re-design Button (Cycles Card Style) */}
              <button
                onClick={cycleCardStyle}
                className="bg-emerald-700 hover:bg-emerald-600 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1.5"
                title="Change ID Card Design Template"
              >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Re-design</span>
                <span className="bg-emerald-900/40 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-mono hidden sm:inline-block">
                  {currentStyleObj.name}
                </span>
              </button>

              {/* Layout Landscape / Portrait Toggle */}
              <button
                onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                className="bg-indigo-600 hover:bg-indigo-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layout:</span>
                <span>{orientation === 'horizontal' ? 'Landscape' : 'Portrait'}</span>
              </button>

              {/* Single Toggle Button for Photo Frame (Fill Frame / Default Fit) */}
              {companyData.empPhoto && (
                <button
                  onClick={() => setPhotoFitMode(photoFitMode === 'cover' ? 'contain' : 'cover')}
                  className={`border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1.5 ${
                    photoFitMode === 'cover'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                  title={photoFitMode === 'cover' ? 'Switch to Default Fit' : 'Switch to Fill Frame'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{photoFitMode === 'cover' ? 'Default Fit' : 'Fill Frame'}</span>
                </button>
              )}
            </div>
            
            {/* Download Buttons - Sized smaller & compact on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleDownloadA4PDF}
                disabled={isExporting}
                className="bg-teal-600 hover:bg-teal-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1 sm:gap-2"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isExporting ? 'Generating...' : 'Card PDF'}</span>
              </button>
              <button
                onClick={() => handleDownloadPNG('both')}
                disabled={isExporting}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-1 sm:gap-2"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Card PNG</span>
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center bg-neutral-200 overflow-hidden rounded-2xl border border-neutral-300 h-[70vh] sm:h-[80vh] items-center relative">
            <div 
              className="bg-white shadow-2xl shrink-0 flex flex-col items-center justify-center gap-24 origin-center transition-transform duration-300"
              style={{
                width: '1260px',
                height: '1782px',
                transform: `scale(${previewScale})`,
              }}
            >
              <div className="absolute top-[10%] left-0 right-0 text-center">
                <span className="text-3xl font-black text-neutral-200 uppercase tracking-[0.5em] font-mono">
                  A4 Print Preview ({currentStyleObj.name})
                </span>
              </div>

              {/* ==================== FRONT SIDE ==================== */}
              <div
                ref={frontCardRef}
                className={`relative bg-white overflow-hidden shadow-2xl border border-neutral-300 transition-all duration-200 z-10 ${
                  orientation === 'horizontal'
                    ? 'w-[514px] h-[324px] rounded-[16px]'
                    : 'w-[324px] h-[514px] rounded-[16px]'
                }`}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {/* Render Template Style Variants */}
                {cardStyle === 'classic' && (
                  <>
                    <div className="w-full h-3" style={{ backgroundColor: primaryColor }} />
                    {orientation === 'horizontal' ? (
                      <div className="p-4 flex flex-col justify-between h-[calc(100%-12px)]">
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            {uploadedLogo ? (
                              <img src={uploadedLogo} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                                {(companyData.companyName || 'C').charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-black tracking-tight text-neutral-900 uppercase leading-tight max-w-[260px] truncate">
                                {companyData.companyName || DEMO_COMPANY_DATA.companyName}
                              </h3>
                              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                                {companyData.tagline || 'JOB IDENTITY CARD'}
                              </p>
                            </div>
                          </div>
                          <div className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm shrink-0" style={{ backgroundColor: secondaryColor }}>
                            ID: {companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}
                          </div>
                        </div>
                        <div className="grid grid-cols-12 gap-3 items-center my-auto py-1">
                          <div className="col-span-4 flex flex-col items-center justify-center">
                            <div className="w-[110px] h-[135px] bg-neutral-100 border-2 overflow-hidden shadow-sm flex items-center justify-center relative shrink-0" style={{ borderRadius: '6px', borderColor: primaryColor, backgroundColor: photoBgColor }}>
                              {companyData.empPhoto ? (
                                <img
                                  src={companyData.empPhoto}
                                  alt={companyData.empName}
                                  className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                  style={{ filter: photoFilterStyle, borderRadius: '6px' }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-2 text-center text-neutral-400">
                                  <span className="text-2xl mb-1">👤</span>
                                  <span className="text-[8px] font-bold uppercase tracking-wider">Photo</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-8 flex flex-col justify-center space-y-2">
                            <div>
                              <h4 className="text-base font-black text-neutral-900 uppercase tracking-tight leading-tight">
                                {companyData.empName || DEMO_COMPANY_DATA.empName}
                              </h4>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white inline-block mt-1" style={{ backgroundColor: primaryColor }}>
                                {companyData.empRole || DEMO_COMPANY_DATA.empRole}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] font-medium text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                              <div className="flex justify-between items-center">
                                <span className="text-neutral-400 font-bold uppercase text-[9px]">Mobile:</span>
                                <span className="font-bold text-neutral-900">{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-neutral-400 font-bold uppercase text-[9px]">Email:</span>
                                <span className="font-bold text-neutral-800 text-[10px] truncate max-w-[180px]">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                          <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest">AUTHORIZED IDENTITY BADGE</span>
                          <div className="flex items-center gap-[2px] h-5 w-36 bg-white">
                            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4].map((w, i) => (
                              <div key={i} className="h-full bg-neutral-900" style={{ width: `${w}px` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between p-4 h-[calc(100%-12px)] text-center">
                        <div className="flex flex-col items-center gap-1 w-full border-b border-neutral-200 pb-2">
                          <h3 className="text-xs font-black uppercase text-neutral-900">{companyData.companyName || DEMO_COMPANY_DATA.companyName}</h3>
                          <p className="text-[8px] font-bold uppercase text-neutral-500">JOB IDENTITY CARD</p>
                        </div>
                        <div className="relative my-2">
                          <div className="w-28 h-36 bg-neutral-100 border-2 overflow-hidden shadow-sm flex items-center justify-center relative" style={{ borderRadius: '6px', borderColor: primaryColor, backgroundColor: photoBgColor }}>
                            {companyData.empPhoto ? (
                              <img
                                src={companyData.empPhoto}
                                alt={companyData.empName}
                                className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                style={{ filter: photoFilterStyle, borderRadius: '6px' }}
                              />
                            ) : (
                              <div className="text-neutral-400 text-center text-xs">👤 Photo</div>
                            )}
                          </div>
                        </div>
                        <div className="w-full space-y-1">
                          <h4 className="text-sm font-black text-neutral-900 uppercase">{companyData.empName || DEMO_COMPANY_DATA.empName}</h4>
                          <p className="text-xs font-bold text-emerald-800 uppercase">{companyData.empRole || DEMO_COMPANY_DATA.empRole}</p>
                          <p className="text-[10px] text-neutral-600">ID: {companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}</p>
                        </div>
                        <div className="w-full text-[10px] space-y-0.5 border-t border-neutral-200 pt-2">
                          <p className="text-neutral-800 font-bold">{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                          <p className="text-neutral-700 truncate">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {cardStyle === 'modern' && (
                  <>
                    <div className="w-full h-12 flex items-center justify-between px-4" style={{ backgroundColor: primaryColor }}>
                      <span className="text-white font-black text-xs uppercase tracking-wider truncate max-w-[280px]">
                        {companyData.companyName || DEMO_COMPANY_DATA.companyName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded text-neutral-900 font-mono shadow-xs" style={{ backgroundColor: accentColor }}>
                        {companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}
                      </span>
                    </div>
                    {orientation === 'horizontal' ? (
                      <div className="p-4 flex flex-col justify-between h-[calc(100%-48px)] bg-slate-50">
                        <div className="grid grid-cols-12 gap-3 items-center my-auto">
                          <div className="col-span-4 flex justify-center">
                            <div className="w-[110px] h-[135px] rounded-2xl border-4 shadow-md overflow-hidden bg-white flex items-center justify-center" style={{ borderColor: secondaryColor, backgroundColor: photoBgColor }}>
                              {companyData.empPhoto ? (
                                <img
                                  src={companyData.empPhoto}
                                  alt={companyData.empName}
                                  className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                  style={{ filter: photoFilterStyle }}
                                />
                              ) : (
                                <span className="text-3xl text-neutral-300">👤</span>
                              )}
                            </div>
                          </div>
                          <div className="col-span-8 space-y-2">
                            <div>
                              <h4 className="text-base font-black text-slate-900 uppercase">
                                {companyData.empName || DEMO_COMPANY_DATA.empName}
                              </h4>
                              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                {companyData.empRole || DEMO_COMPANY_DATA.empRole}
                              </p>
                            </div>
                            <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                              <p><strong className="text-slate-400 uppercase text-[9px]">Mobile:</strong> <span className="text-slate-800 font-bold">{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</span></p>
                              <p><strong className="text-slate-400 uppercase text-[9px]">Email:</strong> <span className="text-slate-800 font-bold">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</span></p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-[9px] text-slate-400 font-bold uppercase">
                          <span>OFFICIAL JOB ID BADGE</span>
                          <span style={{ color: primaryColor }}>{companyData.companyName || DEMO_COMPANY_DATA.companyName}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex flex-col items-center justify-between h-[calc(100%-48px)] text-center bg-slate-50">
                        <div className="w-28 h-36 rounded-2xl border-4 shadow-md overflow-hidden bg-white my-2" style={{ borderColor: secondaryColor, backgroundColor: photoBgColor }}>
                          {companyData.empPhoto ? (
                            <img
                              src={companyData.empPhoto}
                              alt={companyData.empName}
                              className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                              style={{ filter: photoFilterStyle }}
                            />
                          ) : (
                            <span className="text-3xl text-neutral-300">👤</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-900 uppercase">{companyData.empName || DEMO_COMPANY_DATA.empName}</h4>
                          <p className="text-xs font-bold text-emerald-700 uppercase">{companyData.empRole || DEMO_COMPANY_DATA.empRole}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}</p>
                        </div>
                        <div className="w-full text-[10px] space-y-0.5 border-t border-slate-200 pt-2 text-slate-700">
                          <p className="font-bold">{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                          <p className="truncate">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {cardStyle === 'tech' && (
                  <div className="h-full bg-slate-950 text-white flex flex-col justify-between p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 z-10">
                      <div>
                        <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase truncate max-w-[240px]">
                          {companyData.companyName || DEMO_COMPANY_DATA.companyName}
                        </h3>
                        <p className="text-[8px] text-slate-400 font-mono">STAFF IDENTIFICATION</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 text-emerald-300 rounded font-bold">
                        #{companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}
                      </span>
                    </div>

                    {orientation === 'horizontal' ? (
                      <div className="grid grid-cols-12 gap-3 items-center my-auto z-10">
                        <div className="col-span-4 flex justify-center">
                          <div className="w-[110px] h-[135px] border border-emerald-500/40 rounded-lg overflow-hidden bg-slate-900 shadow-inner" style={{ backgroundColor: photoBgColor }}>
                            {companyData.empPhoto ? (
                              <img
                                src={companyData.empPhoto}
                                alt={companyData.empName}
                                className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                style={{ filter: photoFilterStyle }}
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center text-slate-600">👤</div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-8 space-y-2">
                          <div>
                            <h4 className="text-base font-black uppercase text-white tracking-wide">
                              {companyData.empName || DEMO_COMPANY_DATA.empName}
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                              // {companyData.empRole || DEMO_COMPANY_DATA.empRole}
                            </span>
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-300 bg-slate-900/80 border border-slate-800 p-2 rounded-lg space-y-1">
                            <p><span className="text-slate-500">TEL:</span> {companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                            <p className="truncate"><span className="text-slate-500">MAIL:</span> {companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between flex-1 py-2 text-center z-10">
                        <div className="w-28 h-36 border border-emerald-500/40 rounded-lg overflow-hidden bg-slate-900 my-1" style={{ backgroundColor: photoBgColor }}>
                          {companyData.empPhoto ? (
                            <img
                              src={companyData.empPhoto}
                              alt={companyData.empName}
                              className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                              style={{ filter: photoFilterStyle }}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-600">👤</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black uppercase text-white">{companyData.empName || DEMO_COMPANY_DATA.empName}</h4>
                          <p className="text-xs font-mono text-emerald-400 uppercase">// {companyData.empRole || DEMO_COMPANY_DATA.empRole}</p>
                        </div>
                        <div className="w-full text-[10px] font-mono text-slate-300 space-y-0.5 border-t border-slate-800 pt-2">
                          <p>{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                          <p className="truncate">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 text-[8px] font-mono text-slate-500 z-10">
                      <span>VERIFIED SECURITY CARD</span>
                      <span className="text-emerald-500">STATUS: ACTIVE</span>
                    </div>
                  </div>
                )}

                {cardStyle === 'curved' && (
                  <div className="h-full bg-neutral-100 p-3 flex flex-col justify-between relative">
                    <div className="bg-white rounded-xl shadow-xs border border-neutral-200 p-3 flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b pb-2 border-neutral-100">
                        <span className="text-xs font-black text-neutral-800 uppercase truncate max-w-[220px]">
                          {companyData.companyName || DEMO_COMPANY_DATA.companyName}
                        </span>
                        <span className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: primaryColor }}>
                          {companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}
                        </span>
                      </div>

                      {orientation === 'horizontal' ? (
                        <div className="grid grid-cols-12 gap-3 items-center my-auto">
                          <div className="col-span-4 flex justify-center">
                            <div className="w-[110px] h-[135px] rounded-xl border-2 border-dashed p-1 shadow-xs bg-white" style={{ borderColor: accentColor, backgroundColor: photoBgColor }}>
                              <div className="w-full h-full rounded-lg overflow-hidden">
                                {companyData.empPhoto ? (
                                  <img
                                    src={companyData.empPhoto}
                                    alt={companyData.empName}
                                    className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                    style={{ filter: photoFilterStyle }}
                                  />
                                ) : (
                                  <div className="h-full bg-neutral-100 flex items-center justify-center text-neutral-400">👤</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-8 space-y-2">
                            <div>
                              <h4 className="text-base font-black text-neutral-900 uppercase">
                                {companyData.empName || DEMO_COMPANY_DATA.empName}
                              </h4>
                              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                {companyData.empRole || DEMO_COMPANY_DATA.empRole}
                              </p>
                            </div>
                            <div className="text-[11px] text-neutral-700 space-y-1 bg-neutral-50 p-2 rounded-lg border border-neutral-200/80">
                              <p><strong>Mobile:</strong> {companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                              <p className="truncate"><strong>Email:</strong> {companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-between flex-1 py-2 text-center">
                          <div className="w-28 h-36 rounded-xl border-2 border-dashed p-1 shadow-xs bg-white my-1" style={{ borderColor: accentColor, backgroundColor: photoBgColor }}>
                            <div className="w-full h-full rounded-lg overflow-hidden">
                              {companyData.empPhoto ? (
                                <img
                                  src={companyData.empPhoto}
                                  alt={companyData.empName}
                                  className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                  style={{ filter: photoFilterStyle }}
                                />
                              ) : (
                                <div className="h-full bg-neutral-100 flex items-center justify-center text-neutral-400">👤</div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-neutral-900 uppercase">{companyData.empName || DEMO_COMPANY_DATA.empName}</h4>
                            <p className="text-xs font-bold text-emerald-800 uppercase">{companyData.empRole || DEMO_COMPANY_DATA.empRole}</p>
                          </div>
                          <div className="w-full text-[10px] text-neutral-700 space-y-0.5 border-t border-neutral-100 pt-2">
                            <p>{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                            <p className="truncate">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                          </div>
                        </div>
                      )}

                      <div className="text-center pt-1 border-t border-neutral-100 text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest">
                        AUTHORIZED IDENTITY ACCESS
                      </div>
                    </div>
                  </div>
                )}

                {cardStyle === 'minimal' && (
                  <div className="h-full bg-white p-4 flex flex-col justify-between border-8" style={{ borderColor: primaryColor }}>
                    <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-2">
                      <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider truncate max-w-[240px]">
                        {companyData.companyName || DEMO_COMPANY_DATA.companyName}
                      </h3>
                      <span className="text-[10px] font-black text-neutral-900 uppercase">
                        ID #{companyData.empIdNumber || DEMO_COMPANY_DATA.empIdNumber}
                      </span>
                    </div>

                    {orientation === 'horizontal' ? (
                      <div className="grid grid-cols-12 gap-3 items-center my-auto">
                        <div className="col-span-4 flex justify-center">
                          <div className="w-[110px] h-[135px] border-2 border-neutral-900 shadow-sm overflow-hidden" style={{ backgroundColor: photoBgColor }}>
                            {companyData.empPhoto ? (
                              <img
                                src={companyData.empPhoto}
                                alt={companyData.empName}
                                className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                                style={{ filter: photoFilterStyle }}
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center text-neutral-400 font-bold">PHOTO</div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-8 space-y-2">
                          <div>
                            <h4 className="text-base font-black text-neutral-900 uppercase">
                              {companyData.empName || DEMO_COMPANY_DATA.empName}
                            </h4>
                            <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: primaryColor }}>
                              {companyData.empRole || DEMO_COMPANY_DATA.empRole}
                            </p>
                          </div>
                          <div className="text-[11px] font-bold text-neutral-800 space-y-1">
                            <p>M: {companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                            <p className="truncate">E: {companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between flex-1 py-2 text-center">
                        <div className="w-28 h-36 border-2 border-neutral-900 shadow-sm overflow-hidden my-1" style={{ backgroundColor: photoBgColor }}>
                          {companyData.empPhoto ? (
                            <img
                              src={companyData.empPhoto}
                              alt={companyData.empName}
                              className={`w-full h-full ${photoFitMode === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                              style={{ filter: photoFilterStyle }}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400 font-bold">PHOTO</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-neutral-900 uppercase">{companyData.empName || DEMO_COMPANY_DATA.empName}</h4>
                          <p className="text-xs font-extrabold uppercase" style={{ color: primaryColor }}>{companyData.empRole || DEMO_COMPANY_DATA.empRole}</p>
                        </div>
                        <div className="w-full text-[10px] font-bold text-neutral-800 space-y-0.5 border-t border-neutral-200 pt-2">
                          <p>{companyData.empPhone || companyData.phone || DEMO_COMPANY_DATA.empPhone}</p>
                          <p className="truncate">{companyData.empEmail || companyData.email || DEMO_COMPANY_DATA.empEmail}</p>
                        </div>
                      </div>
                    )}

                    <div className="border-t-2 border-neutral-900 pt-1 text-[8px] font-black uppercase tracking-widest text-neutral-500 text-center">
                      CORPORATE EMPLOYEE CARD
                    </div>
                  </div>
                )}
              </div>

              {/* ==================== BACK SIDE ==================== */}
              <div
                ref={backCardRef}
                className={`relative bg-neutral-50 overflow-hidden shadow-2xl border border-neutral-300 transition-all duration-200 flex flex-col justify-between z-10 ${
                  orientation === 'horizontal'
                    ? 'w-[514px] h-[324px] rounded-[16px]'
                    : 'w-[324px] h-[514px] rounded-[16px]'
                }`}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                <div className="w-full h-3" style={{ backgroundColor: primaryColor }} />
                <div className="p-4 flex flex-col justify-between flex-1 text-center">
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-neutral-800">TERMS & CONDITIONS OF USE</h5>
                    <p className="text-[9px] text-neutral-600 leading-relaxed font-medium px-4">
                      This card is the official property of <strong className="text-neutral-900">{companyData.companyName || DEMO_COMPANY_DATA.companyName}</strong>. It must be displayed at all times while on company premises and returned upon request or resignation.
                    </p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-2.5 mx-2 my-1 space-y-1 text-[10px] text-neutral-800 shadow-sm">
                    <p className="font-black uppercase text-neutral-900">{companyData.companyName || DEMO_COMPANY_DATA.companyName}</p>
                    <p className="text-[9px] text-neutral-600 font-medium leading-tight">{companyData.address || DEMO_COMPANY_DATA.address}</p>
                    <div className="flex justify-center gap-4 text-[9.5px] font-bold text-neutral-800 pt-0.5">
                      <span>Hotline: {companyData.phone || DEMO_COMPANY_DATA.phone}</span>
                      <span>Email: {companyData.email || DEMO_COMPANY_DATA.email}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between px-4 pt-1">
                    <div className="text-left">
                      <span className="text-[8px] text-neutral-400 font-bold block">VALID THRU</span>
                      <span className="text-[9.5px] font-bold text-neutral-800">DEC 2028</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-28 border-b border-neutral-900 pb-0.5 text-center font-serif text-[11px] italic font-bold text-neutral-900">
                        {companyData.empName ? companyData.empName.split(' ')[0] : 'Authorized'}
                      </div>
                      <span className="text-[8px] font-black uppercase text-neutral-500 mt-0.5">AUTHORIZED SIGNATURE</span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-3" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
