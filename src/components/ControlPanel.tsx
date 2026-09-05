import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  History, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  FileDown, 
  FileUp, 
  BookmarkCheck,
  Building2,
  User,
  Palette,
  Download,
  FileText,
  CreditCard,
  Layers,
  RotateCcw,
  Shuffle,
  Eye,
  Check
} from 'lucide-react';
import { CompanyData, DesignControls, HistoryItem } from '../types';
import { 
  THEMES,
  DEMO_COMPANY_DATA 
} from '../data';

// Preset Templates for one-click quick loading and instant visual testing
const PRESET_TEMPLATES = [
  {
    label: 'Demo Hub',
    data: DEMO_COMPANY_DATA,
  },
  {
    label: 'Corporate Trade',
    data: {
      companyName: "Apex International Ltd.",
      address: "Suites 701-703, Sena Kalyan Bhaban, Motijheel, Dhaka-1000",
      phone: "+8802223389011",
      email: "corporate@apexintl.com.bd",
      tagline: "Excellence in Global Trade & Commerce",
      empName: "Engr. Tanvir Ahmed",
      empRole: "Managing Director",
      empPhone: "+8801711223344",
      empEmail: "tanvir.ahmed@apexintl.com.bd",
      empIdNumber: "APX-0104",
      empValidity: "DEC 2029",
      authSignature: "",
      casing: 'title' as const,
      industry: 'corporate' as const,
    },
  },
  {
    label: 'Creative IT',
    data: {
      companyName: "Nexus Digital Labs",
      address: "Level 9, Crystal Palace, Road 140, Gulshan-1, Dhaka-1212",
      phone: "+8801988220011",
      email: "hello@nexusdigitallabs.com",
      tagline: "nexusdigitallabs.com",
      empName: "Farhan Kabir",
      empRole: "Head of Product Design",
      empPhone: "+8801844990022",
      empEmail: "farhan@nexusdigitallabs.com",
      empIdNumber: "NX-8921",
      empValidity: "DEC 2028",
      authSignature: "",
      casing: 'title' as const,
      industry: 'creative' as const,
    },
  },
  {
    label: 'Legal Chambers',
    data: {
      companyName: "Chowdhury & Associates",
      address: "Chamber 402, Supreme Court Bar Association, Dhaka-1000",
      phone: "+8801712004455",
      email: "chambers@chowdhurylegal.com",
      tagline: "Barristers, Advocates & Legal Consultants",
      empName: "Barrister Rafiqul Islam",
      empRole: "Senior Partner & Advocate",
      empPhone: "+8801911334455",
      empEmail: "rafiqul@chowdhurylegal.com",
      empIdNumber: "LAW-1008",
      empValidity: "DEC 2030",
      authSignature: "",
      casing: 'title' as const,
      industry: 'legal' as const,
    },
  },
];

// Motion variants for smooth transitions
const stepContainerVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      staggerChildren: 0.035,
      delayChildren: 0.02,
    },
  },
  exit: { opacity: 0, x: 16, transition: { duration: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
};

interface ControlPanelProps {
  companyData: CompanyData;
  controls: DesignControls;
  onDataChange: (data: CompanyData) => void;
  onControlsChange: (controls: DesignControls) => void;
  onGenerate: () => void;
  onRandomTheme?: () => void;
  onResetAll?: () => void;
  onDownloadPadPDF: () => void;
  onDownloadCardPDF: () => void;
  onExportCardSVG: () => void;
  onExportPadSVG: () => void;
  onDownloadCardPNG: () => void;
  onDownloadPadPNG: () => void;
  onExportAI: () => void;
  onExportPSD: () => void;
  onSaveTemplate?: () => void;
  onLoadTemplate?: (payload: any) => void;
  error: string | null;
  status: string | null;
  onOpenHistory: () => void;
  historyCount: number;
  uploadedLogo: string;
  onUploadedLogoChange: (logo: string) => void;
  uploadedLogoSize: number;
  onUploadedLogoSizeChange: (size: number) => void;
  uploadedLogoOpacity: number;
  onUploadedLogoOpacityChange: (opacity: number) => void;
  templateLoadKey?: number | string;
  lastLoadedItem?: HistoryItem | null;
  themeIdx?: number;
  onThemeChange?: (index: number) => void;
  onPreviewClick?: () => void;
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
  onExportCardSVG,
  onExportPadSVG,
  onDownloadCardPNG,
  onDownloadPadPNG,
  onExportAI,
  onExportPSD,
  onSaveTemplate,
  onLoadTemplate,
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
  templateLoadKey = 1,
  lastLoadedItem,
  themeIdx = 0,
  onThemeChange,
  onPreviewClick,
}) => {
  const [activeStep, setActiveStep] = useState<'info' | 'style' | 'export'>('info');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const templateFileInputRef = useRef<HTMLInputElement>(null);
  const [isSmartFilling, setIsSmartFilling] = useState(false);
  const [showLoadFeedback, setShowLoadFeedback] = useState(false);
  const [loadFeedbackText, setLoadFeedbackText] = useState('');
  const prevKeyRef = useRef(templateLoadKey);

  // Trigger feedback notification banner whenever template or history is loaded
  useEffect(() => {
    if (templateLoadKey && templateLoadKey !== prevKeyRef.current) {
      prevKeyRef.current = templateLoadKey;
      const itemName = lastLoadedItem?.title || lastLoadedItem?.filename || lastLoadedItem?.data?.companyName;
      const message = itemName 
        ? `History Item Loaded: ${itemName}`
        : (companyData.companyName ? `Template Loaded: ${companyData.companyName}` : 'Template applied');
      
      setLoadFeedbackText(message);
      setShowLoadFeedback(true);
      const timer = setTimeout(() => setShowLoadFeedback(false), 3200);
      return () => clearTimeout(timer);
    }
  }, [templateLoadKey, lastLoadedItem, companyData.companyName]);

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (onLoadTemplate) {
            onLoadTemplate(parsed);
          } else if (parsed.data) {
            onDataChange(parsed.data);
          }
        } catch (err) {
          alert('Failed to parse template JSON file.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    if (onLoadTemplate) {
      onLoadTemplate({ data: preset.data });
    } else {
      onDataChange(preset.data);
    }
  };

  const handleSmartFill = async () => {
    if (!companyData.companyName) {
      alert("Please enter a Company Name first to use Smart Fill.");
      return;
    }
    setIsSmartFilling(true);
    try {
      const prompt = `Based on the company name "${companyData.companyName}", generate realistic corporate details in JSON format:
{
  "address": "Realistic street address in Bangladesh or global format",
  "phone": "+88017XXXXXXXX or local standard",
  "email": "info@domain.com or similar",
  "tagline": "A punchy, professional 3-5 word slogan or web domain",
  "empName": "A professional executive name",
  "empRole": "Managing Director, CEO, or Head of Ops",
  "empPhone": "Mobile number",
  "empEmail": "executive@domain.com",
  "empIdNumber": "ID badge e.g. EMP-9901",
  "casing": "title"
}
Output ONLY valid raw JSON with no markdown backticks.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (response.ok) {
        const data = await response.json();
        let cleaned = data.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
        }
        const parsed = JSON.parse(cleaned);
        onDataChange({
          ...companyData,
          ...parsed
        });
      }
    } catch (err) {
      console.error("Smart fill failed", err);
    } finally {
      setIsSmartFilling(false);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    onDataChange({
      ...companyData,
      [field]: value
    });
  };

  const getInputProps = (field: keyof CompanyData, placeholder: string, id: string) => ({
    id,
    value: companyData[field] || '',
    placeholder: (DEMO_COMPANY_DATA as any)[field] || placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value),
    className: "w-full p-2 border border-[#DDDEDC] rounded-lg text-[13px] bg-[#FBFBFA] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)]/25 focus:border-[var(--ui-accent)] transition-all",
  });

  return (
    <div className="flex flex-col h-full bg-white border border-[#DDDEDC] shadow-xs rounded-xl overflow-hidden font-sans">
      
      {/* 1. TOP HEADER & BRANDING */}
      <div className="p-3.5 sm:p-4 border-b border-[#DDDEDC] bg-[#FBFBFA] flex justify-between items-center shrink-0">
        <div>
          <a
            id="link-extractor-brand"
            href="https://extractor.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-black tracking-tight text-neutral-900 hover:text-[var(--ui-accent)] transition-colors flex items-center gap-1.5"
          >
            Extractor<span className="text-[var(--ui-accent)]">.fun</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {onPreviewClick && (
            <button
              type="button"
              id="btn-switch-preview-mobile"
              onClick={onPreviewClick}
              className="lg:hidden text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-[#DDDEDC] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live View</span>
            </button>
          )}

          <button
            id="btn-open-history-drawer"
            onClick={onOpenHistory}
            className="bg-amber-500 hover:bg-amber-400 border-b-3 border-black/20 active:border-b-0 active:translate-y-[2px] shadow-sm text-white font-bold px-3 py-1.5 rounded-full text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Open Saved Downloads History"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({historyCount})</span>
          </button>
        </div>
      </div>

      {/* 2. ERROR & STATUS NOTIFICATIONS */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs border-b border-red-200 font-mono shrink-0">
          {error}
        </div>
      )}

      {/* Dynamic Visual Feedback Toast */}
      <AnimatePresence>
        {showLoadFeedback && (
          <motion.div
            id="template-load-feedback-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-3.5 py-2 text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="truncate font-medium">{loadFeedbackText}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0 ml-2">
              Ready
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SIMPLIFIED 3-STEP TAB SWITCHER (IDEA 1) */}
      <div className="p-3 bg-[#FBFBFA] border-b border-[#DDDEDC] shrink-0">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-200/70 rounded-xl">
          <button
            type="button"
            id="tab-step-info"
            onClick={() => setActiveStep('info')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              activeStep === 'info'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300 ring-1 ring-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
              activeStep === 'info' ? 'bg-indigo-600 text-white' : 'bg-neutral-400 text-white'
            }`}>
              1
            </span>
            <span className="truncate">Basic Info</span>
          </button>

          <button
            type="button"
            id="tab-step-style"
            onClick={() => setActiveStep('style')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              activeStep === 'style'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300 ring-1 ring-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
              activeStep === 'style' ? 'bg-indigo-600 text-white' : 'bg-neutral-400 text-white'
            }`}>
              2
            </span>
            <span className="truncate">Style & Logo</span>
          </button>

          <button
            type="button"
            id="tab-step-export"
            onClick={() => setActiveStep('export')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              activeStep === 'export'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300 ring-1 ring-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
              activeStep === 'export' ? 'bg-emerald-600 text-white' : 'bg-neutral-400 text-white'
            }`}>
              3
            </span>
            <span className="truncate">Quick Export</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN SCROLLABLE BODY (Tab Content) */}
      <div className="flex-grow flex-1 overflow-y-auto p-4 md:p-6 bg-white">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* STEP 1: BASIC INFO (তথ্য দিন) */}
          {/* ======================================================== */}
          {activeStep === 'info' && (
            <motion.div
              key={`step-info-${templateLoadKey}`}
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-5"
            >
              {/* Quick Preset & AI Bar */}
              <motion.div variants={itemVariants} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-neutral-600 flex items-center gap-1">
                    <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                    1-Click Auto Fill
                  </span>
                  <button
                    type="button"
                    id="btn-smart-fill-ai"
                    onClick={handleSmartFill}
                    disabled={isSmartFilling}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSmartFilling ? 'Generating...' : 'Smart Fill AI'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TEMPLATES.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      id={`btn-quick-preset-${idx}`}
                      onClick={() => handleApplyPreset(preset)}
                      className="text-[10.5px] font-medium px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 text-neutral-700 hover:text-indigo-700 border border-neutral-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Company Credentials */}
              <div className="flex flex-col gap-3">
                <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-neutral-200 pb-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide">
                    Company Information
                  </span>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <motion.div variants={itemVariants} className="flex flex-col gap-1 md:col-span-2">
                    <label htmlFor="field-company-name" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Company Name *
                    </label>
                    <input type="text" {...getInputProps('companyName', 'e.g. Subarna Traders Ltd.', 'field-company-name')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1 md:col-span-2">
                    <label htmlFor="field-company-address" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Office Address
                    </label>
                    <input type="text" {...getInputProps('address', 'e.g. 24 Motijheel C/A, Dhaka-1000', 'field-company-address')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <label htmlFor="field-company-phone" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Official Phone
                    </label>
                    <input type="text" {...getInputProps('phone', '+880222334455', 'field-company-phone')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <label htmlFor="field-company-email" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Official Email
                    </label>
                    <input type="email" {...getInputProps('email', 'info@company.com', 'field-company-email')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1 md:col-span-2">
                    <label htmlFor="field-company-tagline" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Tagline / Website URL
                    </label>
                    <input type="text" {...getInputProps('tagline', 'www.company.com', 'field-company-tagline')} />
                  </motion.div>
                </div>
              </div>

              {/* Visiting Card Holder Section */}
              <div className="flex flex-col gap-3 pt-2">
                <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-neutral-200 pb-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide">
                    Visiting Card Holder (Personal)
                  </span>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <label htmlFor="field-emp-name" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Person Name
                    </label>
                    <input type="text" {...getInputProps('empName', 'e.g. Md. Tanvir Ahmed', 'field-emp-name')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <label htmlFor="field-emp-role" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Designation
                    </label>
                    <input type="text" {...getInputProps('empRole', 'e.g. Managing Director', 'field-emp-role')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <label htmlFor="field-emp-phone" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Direct Mobile
                    </label>
                    <input type="text" {...getInputProps('empPhone', '+8801711223344', 'field-emp-phone')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <label htmlFor="field-emp-email" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Personal Email
                    </label>
                    <input type="email" {...getInputProps('empEmail', 'tanvir@company.com', 'field-emp-email')} />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-1 md:col-span-2">
                    <label htmlFor="field-emp-id" className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      Employee ID / Badge No
                    </label>
                    <input type="text" {...getInputProps('empIdNumber', 'e.g. APX-0104', 'field-emp-id')} />
                  </motion.div>
                </div>
              </div>

              {/* Step 1 Bottom Nav */}
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-2">
                {onResetAll && (
                  <button
                    type="button"
                    onClick={onResetAll}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-800 flex items-center gap-1 py-2 px-2.5 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-next-to-style"
                  onClick={() => setActiveStep('style')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
                >
                  <span>Continue to Style & Logo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: STYLE & BRANDING (লোগো ও লুক) */}
          {/* ======================================================== */}
          {activeStep === 'style' && (
            <motion.div
              key="step-style"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-5"
            >
              {/* Brand Logo Upload Box */}
              <div className="p-4 bg-[#FBFBFA] border border-neutral-200 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Custom Brand Logo
                  </span>
                  {uploadedLogo && (
                    <button
                      type="button"
                      id="btn-remove-logo"
                      onClick={() => {
                        onUploadedLogoChange('');
                        if (logoInputRef.current) logoInputRef.current.value = '';
                      }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  id="input-file-brand-logo"
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

                {!uploadedLogo ? (
                  <button
                    type="button"
                    id="btn-upload-logo-action"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-6 px-4 border-2 border-dashed border-neutral-300 hover:border-indigo-400 rounded-xl bg-white flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-indigo-50/40"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-neutral-800">Click to Upload Brand Logo</div>
                    <div className="text-[10.5px] text-neutral-500 font-mono">Supports transparent PNG or JPG</div>
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-2.5 bg-white border border-neutral-200 rounded-lg">
                      <img
                        src={uploadedLogo}
                        alt="Logo Preview"
                        className="w-12 h-12 object-contain bg-neutral-50 border border-neutral-200 rounded p-1"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Custom Logo Active</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">Watermark & Letterhead synced</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="text-[11px] font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Watermark Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10.5px] font-mono">
                          <span className="text-neutral-500 uppercase font-semibold">Watermark Size</span>
                          <span className="font-bold text-indigo-600">{uploadedLogoSize}mm</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="180"
                          value={uploadedLogoSize}
                          onChange={(e) => onUploadedLogoSizeChange(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10.5px] font-mono">
                          <span className="text-neutral-500 uppercase font-semibold">Watermark Opacity</span>
                          <span className="font-bold text-indigo-600">{Math.round(uploadedLogoOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="1.00"
                          step="0.01"
                          value={uploadedLogoOpacity}
                          onChange={(e) => onUploadedLogoOpacityChange(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Name Casing */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label className="text-[10.5px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                  Company Name Casing Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('casing', 'title')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      (companyData.casing || 'title') === 'title'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    Title Case (e.g. Apex International)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('casing', 'upper')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      companyData.casing === 'upper'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    UPPERCASE (e.g. APEX INTERNATIONAL)
                  </button>
                </div>
              </motion.div>

              {/* Color & Theme Palette Selection */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide">
                      Select Color Theme
                    </span>
                  </div>
                  {onRandomTheme && (
                    <button
                      type="button"
                      id="btn-random-theme"
                      onClick={onRandomTheme}
                      className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-all"
                      title="Shuffle to a random stylish color theme"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Randomize</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {THEMES.slice(0, 10).map((t, idx) => {
                    const isSelected = themeIdx === idx;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        id={`btn-theme-${idx}`}
                        onClick={() => onThemeChange && onThemeChange(idx)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Color Swatch Pill */}
                          <div className="flex items-center -space-x-1 shrink-0">
                            <span 
                              className="w-4 h-4 rounded-full border border-white shadow-xs" 
                              style={{ backgroundColor: t.primary }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border border-white shadow-xs" 
                              style={{ backgroundColor: t.accent }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border border-white shadow-xs" 
                              style={{ backgroundColor: t.secondary }} 
                            />
                          </div>
                          <span className={`text-[11.5px] font-bold truncate ${isSelected ? 'text-indigo-950' : 'text-neutral-800'}`}>
                            {t.name}
                          </span>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Step 2 Bottom Nav */}
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-2">
                <button
                  type="button"
                  id="btn-back-to-info"
                  onClick={() => setActiveStep('info')}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  id="btn-next-to-export"
                  onClick={() => setActiveStep('export')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Continue to Quick Export</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: QUICK EXPORT (এক ক্লিকে ডাউনলোড) */}
          {/* ======================================================== */}
          {activeStep === 'export' && (
            <motion.div
              key="step-export"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-5"
            >
              {/* Pad Download Box */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Letterhead Pad (A4 Official)</h4>
                    <p className="text-[10px] text-emerald-700 font-mono">Standard 210 × 297mm official document</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-export-pad-pdf"
                    onClick={onDownloadPadPDF}
                    className="bg-emerald-600 hover:bg-emerald-500 border-b-3 border-black/20 active:border-b-0 active:translate-y-[2px] text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Pad PDF</span>
                  </button>

                  <button
                    type="button"
                    id="btn-export-pad-png"
                    onClick={onDownloadPadPNG}
                    className="bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Pad PNG (300 DPI)</span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    id="btn-export-pad-svg"
                    onClick={onExportPadSVG}
                    className="text-[10.5px] font-semibold text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Export Pad as Vector SVG</span>
                  </button>
                </div>
              </div>

              {/* Visiting Card Download Box */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">Visiting Card (Business Card)</h4>
                    <p className="text-[10px] text-blue-700 font-mono">Standard 89 × 51mm double-sided card</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-export-card-pdf"
                    onClick={onDownloadCardPDF}
                    className="bg-blue-600 hover:bg-blue-500 border-b-3 border-black/20 active:border-b-0 active:translate-y-[2px] text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Card PDF</span>
                  </button>

                  <button
                    type="button"
                    id="btn-export-card-png"
                    onClick={onDownloadCardPNG}
                    className="bg-white hover:bg-blue-100/60 text-blue-900 border border-blue-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Card PNG (High-Res)</span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    id="btn-export-card-svg"
                    onClick={onExportCardSVG}
                    className="text-[10.5px] font-semibold text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Export Card as Vector SVG</span>
                  </button>
                </div>
              </div>

              {/* Source & Template Backup Box */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-2.5">
                <span className="text-[11px] font-mono font-bold uppercase text-neutral-600">
                  Professional Design Files & Backup
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-export-ai"
                    onClick={onExportAI}
                    className="p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3 h-3 text-orange-600" />
                    <span>Illustrator (.ai)</span>
                  </button>

                  <button
                    type="button"
                    id="btn-export-psd"
                    onClick={onExportPSD}
                    className="p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3 h-3 text-blue-600" />
                    <span>Photoshop (.psd)</span>
                  </button>

                  {onSaveTemplate && (
                    <button
                      type="button"
                      id="btn-save-json"
                      onClick={onSaveTemplate}
                      className="p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                      <span>Save JSON Backup</span>
                    </button>
                  )}

                  <div>
                    <input
                      type="file"
                      ref={templateFileInputRef}
                      accept=".json"
                      onChange={handleTemplateFileChange}
                      className="hidden"
                      id="input-file-template-json"
                    />
                    <button
                      type="button"
                      id="btn-import-json"
                      onClick={() => templateFileInputRef.current?.click()}
                      className="w-full p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileUp className="w-3 h-3 text-indigo-600" />
                      <span>Restore JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 Bottom Nav */}
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-3 border-t border-neutral-200 mt-2">
                <button
                  type="button"
                  id="btn-back-to-style"
                  onClick={() => setActiveStep('style')}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Style</span>
                </button>

                <button
                  type="button"
                  id="btn-view-history-step3"
                  onClick={onOpenHistory}
                  className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Downloads History</span>
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 5. FIXED FOOTER AND STATUS MESSAGES */}
      <div className="p-3 border-t border-[#DDDEDC] bg-[#FBFBFA]">
        <div id="control-panel-status" className="text-[11px] font-medium text-[#6B7076] text-center truncate">
          {status || 'Ready • Design your letterhead pad & visiting card'}
        </div>
      </div>
    </div>
  );
};
