import React, { useRef } from 'react';
import { Sparkles, History } from 'lucide-react';
import { CompanyData, DesignControls } from '../types';
import { 
  HEADLINE_FONTS, 
  SHAPES, 
  PAD_LAYOUTS, 
  CARD_LAYOUTS, 
  PAD_LAYOUT_LABELS, 
  CARD_LAYOUT_LABELS, 
  LOGO_STYLES, 
  LOGO_STYLE_LABELS, 
  INDUSTRIES, 
  INDUSTRY_LABELS, 
  GRID_STYLES, 
  GRID_STYLE_LABELS, 
  TEXTURES, 
  TEXTURE_LABELS, 
  DEFAULT_COMPANY_DATA 
} from '../data';

// 3D tactile button color palette with vibrant distinct colors
const BUTTON_3D_PALETTE = [
  { bg: 'bg-emerald-600 hover:bg-emerald-500', activeBg: 'bg-emerald-800', border: 'border-b-4 border-emerald-900 shadow-md text-white' },
  { bg: 'bg-indigo-600 hover:bg-indigo-500', activeBg: 'bg-indigo-800', border: 'border-b-4 border-indigo-900 shadow-md text-white' },
  { bg: 'bg-amber-500 hover:bg-amber-400', activeBg: 'bg-amber-700', border: 'border-b-4 border-amber-800 shadow-md text-white' },
  { bg: 'bg-rose-600 hover:bg-rose-500', activeBg: 'bg-rose-800', border: 'border-b-4 border-rose-900 shadow-md text-white' },
  { bg: 'bg-teal-600 hover:bg-teal-500', activeBg: 'bg-teal-800', border: 'border-b-4 border-teal-900 shadow-md text-white' },
  { bg: 'bg-purple-600 hover:bg-purple-500', activeBg: 'bg-purple-800', border: 'border-b-4 border-purple-900 shadow-md text-white' },
  { bg: 'bg-sky-600 hover:bg-sky-500', activeBg: 'bg-sky-800', border: 'border-b-4 border-sky-900 shadow-md text-white' },
  { bg: 'bg-fuchsia-600 hover:bg-fuchsia-500', activeBg: 'bg-fuchsia-800', border: 'border-b-4 border-fuchsia-900 shadow-md text-white' },
  { bg: 'bg-orange-600 hover:bg-orange-500', activeBg: 'bg-orange-800', border: 'border-b-4 border-orange-900 shadow-md text-white' },
  { bg: 'bg-blue-600 hover:bg-blue-500', activeBg: 'bg-blue-800', border: 'border-b-4 border-blue-900 shadow-md text-white' },
  { bg: 'bg-pink-600 hover:bg-pink-500', activeBg: 'bg-pink-800', border: 'border-b-4 border-pink-900 shadow-md text-white' },
  { bg: 'bg-violet-600 hover:bg-violet-500', activeBg: 'bg-violet-800', border: 'border-b-4 border-violet-900 shadow-md text-white' },
  { bg: 'bg-cyan-600 hover:bg-cyan-500', activeBg: 'bg-cyan-800', border: 'border-b-4 border-cyan-900 shadow-md text-white' },
  { bg: 'bg-lime-600 hover:bg-lime-500', activeBg: 'bg-lime-800', border: 'border-b-4 border-lime-900 shadow-md text-white' },
  { bg: 'bg-red-600 hover:bg-red-500', activeBg: 'bg-red-800', border: 'border-b-4 border-red-900 shadow-md text-white' },
];

export const get3DBtnStyle = (index: number, isSelected: boolean) => {
  const item = BUTTON_3D_PALETTE[index % BUTTON_3D_PALETTE.length];
  if (isSelected) {
    return `${item.activeBg} text-white border-b-2 border-black font-black translate-y-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] ring-2 ring-black ring-offset-1 transition-all duration-150`;
  }
  return `${item.bg} ${item.border} font-bold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2`;
};

interface ControlPanelProps {
  companyData: CompanyData;
  controls: DesignControls;
  onDataChange: (data: CompanyData) => void;
  onControlsChange: (controls: DesignControls) => void;
  onGenerate: () => void;
  onRandomTheme: () => void;
  onResetAll: () => void;
  onDownloadPadPDF: () => void;
  onDownloadCardPDF: () => void;
  onExportCardSVG: () => void;
  onExportPadSVG: () => void;
  onDownloadCardPNG: () => void;
  onDownloadPadPNG: () => void;
  onExportAI: () => void;
  onExportPSD: () => void;
  onSaveTemplate: () => void;
  onLoadTemplate: (payload: any) => void;
  error: string | null;
  status: string;
  onOpenHistory: () => void;
  historyCount: number;
  uploadedLogo: string;
  onUploadedLogoChange: (logo: string) => void;
  uploadedLogoSize: number;
  onUploadedLogoSizeChange: (size: number) => void;
  uploadedLogoOpacity: number;
  onUploadedLogoOpacityChange: (opacity: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  companyData,
  controls,
  onDataChange,
  onControlsChange,
  onGenerate,
  onRandomTheme,
  onResetAll,
  onDownloadPadPDF,
  onDownloadCardPDF,
  onDownloadCardPNG,
  onDownloadPadPNG,
  error,
  status,
  onOpenHistory,
  historyCount,
  uploadedLogo,
  onUploadedLogoChange,
  uploadedLogoSize,
  onUploadedLogoSizeChange,
  uploadedLogoOpacity,
  onUploadedLogoOpacityChange,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    onDataChange({
      ...companyData,
      [field]: value,
    });
  };

  const getInputProps = (field: keyof CompanyData, placeholder: string) => ({
    value: companyData[field] === (DEFAULT_COMPANY_DATA as any)[field] ? '' : (companyData[field] || ''),
    placeholder: (DEFAULT_COMPANY_DATA as any)[field] || placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value),
    className: "w-full p-2 border border-[#DDDEDC] rounded text-[13px] bg-[#FBFBFA] text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[var(--ui-accent)] focus:border-[var(--ui-accent)] transition-all",
  });

  const handleControlChange = <K extends keyof DesignControls>(
    key: K,
    value: DesignControls[K]
  ) => {
    onControlsChange({
      ...controls,
      [key]: value,
    });
  };

  return (
    <div id="panel" className="bg-white border-b md:border-b-0 md:border-r border-[#DDDEDC] h-[45vh] md:h-screen flex flex-col overflow-hidden w-full md:w-[380px] shrink-0">
      {/* 1. FIXED HEADER AND MAIN TITLE */}
      <div className="p-5 border-b border-[#DDDEDC] bg-[#FBFBFA] flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-[14px] font-bold tracking-wider text-[#1C1E22] m-0">
            PadGen
          </h1>
        </div>
        <button
          onClick={onOpenHistory}
          className="bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-800 shadow-md text-white font-bold px-3.5 py-1.5 rounded-full text-[11px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          title="Open Saved Downloads History"
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="bg-white text-amber-800 text-[9.5px] px-1.5 py-0.2 rounded-full font-black shrink-0">
              {historyCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="px-5 pt-3 bg-white shrink-0">
          <div
            id="errorBox"
            className="bg-[#FBEAEA] border border-[#E3B6B6] text-[#8A2C2C] text-[12px] p-2 rounded font-medium"
          >
            {error}
          </div>
        </div>
      )}

      {/* 2. SCROLLABLE BODY CONTAINING FORM & DESIGN OPTIONS */}
      <div className="flex-grow flex-1 overflow-y-auto p-5 flex flex-col gap-5 bg-white">
        {/* Company Fields */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-mono text-[var(--ui-accent)] uppercase tracking-wider font-bold border-b border-[#DDDEDC] pb-1">
            Company Credentials
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Company Name
            </label>
            <input type="text" {...getInputProps('companyName', 'e.g. Subarna Traders')} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Company Name Casing Style
            </label>
            <div className="flex gap-1.5">
              {(['title', 'upper'] as const).map((c, idx) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleInputChange('casing', c)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] cursor-pointer ${get3DBtnStyle(
                    idx,
                    (companyData.casing || 'title') === c
                  )}`}
                >
                  {c === 'title' ? 'Title Case' : 'UPPERCASE'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Business Industry / Domain
            </label>
            <select
              value={companyData.industry || 'corporate'}
              onChange={(e) => handleInputChange('industry', e.target.value as any)}
              className="w-full p-2 border border-[#DDDEDC] rounded text-[13px] bg-[#FBFBFA] text-[#1C1E22] focus:outline-none focus:border-[var(--ui-accent)] font-semibold cursor-pointer"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {INDUSTRY_LABELS[ind]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Address
            </label>
            <input type="text" {...getInputProps('address', 'e.g. 24 Motijheel C/A, Dhaka-1000')} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                Telephone
              </label>
              <input type="text" {...getInputProps('phone', 'Phone number')} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                Email
              </label>
              <input type="email" {...getInputProps('email', 'Email address')} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Website / Tagline
            </label>
            <input type="text" {...getInputProps('tagline', 'e.g. www.subarnatraders.com')} />
          </div>
        </div>

        {/* Employee Section */}
        <div className="flex flex-col gap-3 border-t border-[#DDDEDC] pt-3">
          <div className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider font-bold border-b border-[#DDDEDC] pb-1">
            Visiting Card Holder
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Employee Name
            </label>
            <input type="text" {...getInputProps('empName', 'e.g. Md. Rahim Uddin')} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                Designation
              </label>
              <input type="text" {...getInputProps('empRole', 'Designation')} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                Mobile Number
              </label>
              <input type="text" {...getInputProps('empPhone', 'Optional mobile')} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                Employee Email
              </label>
              <input type="email" {...getInputProps('empEmail', 'Optional employee email')} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                ID / Badge No
              </label>
              <input type="text" {...getInputProps('empIdNumber', 'e.g. PH-88026')} />
            </div>
          </div>
        </div>

        {/* Custom Brand Logo */}
        <div className="flex flex-col gap-3 border-t border-[#DDDEDC] pt-3">
          <div className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider font-bold border-b border-[#DDDEDC] pb-1">
            Custom Brand Logo
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Upload Logo (PNG/JPG)
            </label>
            
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    if (evt.target?.result) {
                      onUploadedLogoChange(evt.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className={`flex-1 py-2 px-3 rounded-lg text-[11px] cursor-pointer flex items-center justify-center gap-1.5 ${get3DBtnStyle(0, false)}`}
              >
                Upload Brand Logo
              </button>
              
              {uploadedLogo && (
                <button
                  type="button"
                  onClick={() => {
                    onUploadedLogoChange('');
                    if (logoInputRef.current) logoInputRef.current.value = '';
                  }}
                  className={`py-2 px-3 rounded-lg text-[11px] cursor-pointer ${get3DBtnStyle(3, false)}`}
                  title="Remove Custom Logo"
                >
                  Reset
                </button>
              )}
            </div>
            
            {uploadedLogo && (
              <div className="flex items-center gap-2.5 p-2 bg-[#FBFBFA] border border-[#DDDEDC] rounded">
                <img
                  src={uploadedLogo}
                  alt="Logo Thumbnail"
                  className="w-10 h-10 object-contain border border-[#DDDEDC] bg-white rounded p-0.5"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-neutral-900 truncate">Custom Logo Active</div>
                  <div className="text-[9.5px] font-mono text-[#6B7076]">Procedural SVG replaced</div>
                </div>
              </div>
            )}
          </div>

          {uploadedLogo && (
            <>
              {/* Logo Size Control */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                    Watermark Size (mm)
                  </label>
                  <span className="font-mono text-[10.5px] font-bold text-[var(--ui-accent)]">{uploadedLogoSize}mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  value={uploadedLogoSize}
                  onChange={(e) => onUploadedLogoSizeChange(Number(e.target.value))}
                  className="w-full accent-[var(--ui-accent)] cursor-pointer"
                />
              </div>

              {/* Logo Opacity Control */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
                    Watermark Opacity
                  </label>
                  <span className="font-mono text-[10.5px] font-bold text-[var(--ui-accent)]">{Math.round(uploadedLogoOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.00"
                  step="0.01"
                  value={uploadedLogoOpacity}
                  onChange={(e) => onUploadedLogoOpacityChange(Number(e.target.value))}
                  className="w-full accent-[var(--ui-accent)] cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

        {/* Design Controls */}
        <div className="flex flex-col gap-4 border-t border-[#DDDEDC] pt-3">
          <div className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider font-bold border-b border-[#DDDEDC] pb-1">
            Design Customizations (Live)
          </div>

          {/* Font Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider">
              Typography Stack
            </label>
            <select
              className="w-full p-2 border border-[#DDDEDC] rounded text-[13px] bg-[#FBFBFA] text-[#1C1E22] cursor-pointer focus:outline-none focus:border-[var(--ui-accent)]"
              value={controls.font}
              onChange={(e) => handleControlChange('font', e.target.value)}
            >
              <option value="random">Random Font</option>
              {HEADLINE_FONTS.map((font, idx) => (
                <option key={idx} value={String(idx)}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shape control */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider mb-1">
              Logo Shape
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleControlChange('shape', 'random')}
                className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer ${get3DBtnStyle(
                  0,
                  controls.shape === 'random'
                )}`}
              >
                Random
              </button>
            </div>
          </div>



          {/* Letterhead Grid / Line Toggles */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider mb-1">
              Letterhead Grid / Lines
            </label>
            <select
              value={controls.gridStyle}
              onChange={(e) => handleControlChange("gridStyle", e.target.value as any)}
              className="px-2 py-1.5 rounded-lg border border-[#DDDEDC] bg-[#FBFBFA] text-[#1C1E22] text-[12px] font-bold outline-none focus:border-[var(--ui-accent)] transition-colors cursor-pointer"
            >
              <option value="random">Random</option>
              {GRID_STYLES.map((gSty) => (
                <option key={gSty} value={gSty}>{GRID_STYLE_LABELS[gSty as keyof typeof GRID_STYLE_LABELS]}</option>
              ))}
            </select>
          </div>

          {/* Paper Texture Toggles */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider mb-1">
              Paper Texture
            </label>
            <select
              value={controls.texture}
              onChange={(e) => handleControlChange("texture", e.target.value as any)}
              className="px-2 py-1.5 rounded-lg border border-[#DDDEDC] bg-[#FBFBFA] text-[#1C1E22] text-[12px] font-bold outline-none focus:border-[var(--ui-accent)] transition-colors cursor-pointer"
            >
              <option value="random">Random</option>
              {TEXTURES.map((tex) => (
                <option key={tex} value={tex}>{TEXTURE_LABELS[tex as keyof typeof TEXTURE_LABELS]}</option>
              ))}
            </select>
          </div>

          {/* Card Layout control */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider mb-1">
              Visiting Card Format
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleControlChange('cardLayout', 'random')}
                className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer ${get3DBtnStyle(
                  0,
                  controls.cardLayout === 'random'
                )}`}
              >
                Random
              </button>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex flex-col gap-2.5 border-t border-[#DDDEDC] pt-3">
          <button
            onClick={onGenerate}
            className="w-full bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-900 shadow-md text-white font-black py-2.5 px-4 rounded-xl text-[13px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Generate Design
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRandomTheme}
              className="bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-900 shadow-md text-white font-bold py-2 px-3 rounded-lg text-[11.5px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Random Theme
            </button>
            <button
              onClick={onResetAll}
              className="bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-900 shadow-md text-white font-bold py-2 px-3 rounded-lg text-[11.5px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Reset Inputs
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDownloadPadPDF}
              className="bg-teal-600 hover:bg-teal-500 border-b-4 border-teal-900 shadow-md text-white font-bold py-2 px-3 rounded-lg text-[11.5px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Download Pad PDF
            </button>
            <button
              onClick={onDownloadCardPDF}
              className="bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-900 shadow-md text-white font-bold py-2 px-3 rounded-lg text-[11.5px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Download Card PDF
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDownloadPadPNG}
              className="bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-900 shadow-md text-white font-bold py-2 px-3 rounded-lg text-[11.5px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Download Pad PNG
            </button>
            <button
              onClick={onDownloadCardPNG}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 border-b-4 border-fuchsia-900 shadow-md text-white font-bold py-2 px-3 rounded-lg text-[11.5px] active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Download Card PNG
            </button>
          </div>
        </div>
      </div>

      {/* 3. FIXED FOOTER AND STATUS MESSAGES */}
      <div className="p-3 border-t border-[#DDDEDC] bg-[#FBFBFA]">
        <div className="text-[11px] font-medium text-[#6B7076] text-center">
          {status}
        </div>
      </div>
    </div>
  );
};
