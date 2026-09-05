import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Building,
  User,
  Calendar,
  MapPin,
  Download,
  Copy,
  RotateCcw,
  Eye,
  Edit3,
  History,
  Stamp,
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, Theme, HistoryItem } from '../types';
import {
  NOCFields,
  DEFAULT_NOC_FIELDS,
  DEMO_NOC_FIELDS,
  NOC_CATEGORIES,
  NOCCategory,
} from '../types/noc';
import { generateNOCText, generateNOCPDF, formatDateString } from '../utils/nocUtils';

const splitNocBody = (body: string) => {
  const lowercaseBody = body.toLowerCase();
  const markers = [
    'sincerely,',
    'sincerely',
    'regards,',
    'regards',
    'yours truly,',
    'yours truly',
    'best regards,',
    'best regards',
    'faithfully,',
    'faithfully'
  ];
  
  let splitIndex = -1;
  for (const marker of markers) {
    const idx = lowercaseBody.lastIndexOf(marker);
    if (idx !== -1 && idx > splitIndex) {
      splitIndex = idx;
    }
  }
  
  if (splitIndex !== -1) {
    const before = body.substring(0, splitIndex);
    const after = body.substring(splitIndex);
    return { before, after, hasSplit: true };
  }
  
  return { before: body, after: '', hasSplit: false };
};

interface NOCGeneratorProps {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  theme?: Theme;
  onSaveHistory?: (item: HistoryItem) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  lastLoadedItem?: HistoryItem | null;
  externalSealImage?: string | null;
}

export const NOCGenerator: React.FC<NOCGeneratorProps> = ({
  companyData,
  setCompanyData,
  theme,
  onSaveHistory,
  onOpenHistory,
  historyCount = 0,
  lastLoadedItem,
  externalSealImage,
}) => {
  const [nocFields, setNocFields] = useState<NOCFields>(DEFAULT_NOC_FIELDS);
  const [selectedCategory, setSelectedCategory] = useState<NOCCategory>('Tourist');
  const [nocBody, setNocBody] = useState<string>('');
  const [isManualEdit, setIsManualEdit] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [padStyle, setPadStyle] = useState<'standard' | 'classic' | 'minimal' | 'right-aligned' | 'professional'>('standard');

  // Simple 3-step navigation for setup
  const [activeStep, setActiveStep] = useState<'applicant' | 'company' | 'letter'>('applicant');
  // Mobile toggle between form and preview
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  // Seal / Stamp states & refs
  const [sealImage, setSealImage] = useState<string | null>(null);
  const [sealPos, setSealPos] = useState<{ x: number; y: number }>({ x: 300, y: 480 });
  const [sealSize, setSealSize] = useState<number>(160);
  const [isDraggingSeal, setIsDraggingSeal] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const sealInputRef = useRef<HTMLInputElement | null>(null);
  const documentRef = useRef<HTMLDivElement | null>(null);

  // Sync external seal image when attached from Digital Seal Generator
  useEffect(() => {
    if (externalSealImage) {
      setSealImage(externalSealImage);
    }
  }, [externalSealImage]);

  // Restore fields when a history item is loaded
  useEffect(() => {
    if (lastLoadedItem && lastLoadedItem.section === 'noc') {
      if (lastLoadedItem.nocFields) setNocFields(lastLoadedItem.nocFields);
      if (lastLoadedItem.nocCategory) setSelectedCategory(lastLoadedItem.nocCategory as NOCCategory);
      if (lastLoadedItem.nocBody) {
        setNocBody(lastLoadedItem.nocBody);
        setIsManualEdit(true);
      }
      if (lastLoadedItem.nocSealImage) setSealImage(lastLoadedItem.nocSealImage);
      if (lastLoadedItem.nocSealPos) setSealPos(lastLoadedItem.nocSealPos);
      if (lastLoadedItem.nocSealSize) setSealSize(lastLoadedItem.nocSealSize);
      if (lastLoadedItem.nocPadStyle) setPadStyle(lastLoadedItem.nocPadStyle as any);
    }
  }, [lastLoadedItem]);

  // Auto-generate template text when fields or category change (if not manually edited)
  useEffect(() => {
    if (!isManualEdit) {
      setNocBody(generateNOCText(selectedCategory, nocFields));
    }
  }, [nocFields, selectedCategory, isManualEdit]);

  const handleFieldChange = (key: keyof NOCFields, value: any) => {
    setNocFields((prev) => ({ ...prev, [key]: value }));
    if (key === 'companyName') setCompanyData((prev) => ({ ...prev, companyName: value }));
    if (key === 'companyAddress') setCompanyData((prev) => ({ ...prev, address: value }));
    if (key === 'applicantName') setCompanyData((prev) => ({ ...prev, empName: value }));
    if (key === 'designation') setCompanyData((prev) => ({ ...prev, empRole: value }));
  };

  const [isSmartFilling, setIsSmartFilling] = useState<boolean>(false);

  const handleSmartFill = async () => {
    try {
      setIsSmartFilling(true);
      const compName = nocFields.companyName || companyData.companyName || companyData.name || 'Company Name';
      const res = await fetch('/api/smart-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: compName,
          industry: companyData.industry || 'Corporate',
          applicantName: nocFields.applicantName,
          designation: nocFields.designation,
          nocCategory: selectedCategory,
        }),
      });
      if (!res.ok) throw new Error('Smart fill failed');
      const data = await res.json();
      if (data.nocContent) {
        setNocBody(data.nocContent);
        setIsManualEdit(true);
      }
      if (data.empName) handleFieldChange('applicantName', data.empName);
      if (data.empRole) handleFieldChange('designation', data.empRole);
    } catch (err) {
      console.error('Smart fill error in NOC:', err);
    } finally {
      setIsSmartFilling(false);
    }
  };

  const handleSealPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSeal(true);
    setDragStart({ x: e.clientX - sealPos.x, y: e.clientY - sealPos.y });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleSealPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSeal) return;
    setSealPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleSealPointerUp = (e: React.PointerEvent) => {
    setIsDraggingSeal(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSealImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBodyChange = (value: string) => {
    setIsManualEdit(true);
    setNocBody(value);
  };

  const handleResetBody = () => {
    setIsManualEdit(false);
    setNocBody(generateNOCText(selectedCategory, nocFields));
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(nocBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadPDF = () => {
    const docRect = documentRef.current?.getBoundingClientRect();
    const sealData = sealImage ? {
      sealImage,
      sealPos,
      sealSize,
      containerWidth: docRect?.width || 600,
      containerHeight: docRect?.height || 800,
    } : undefined;

    generateNOCPDF(selectedCategory, nocFields, nocBody, theme, sealData, padStyle);

    if (onSaveHistory) {
      const applicantName = nocFields.applicantName || DEMO_NOC_FIELDS.applicantName;
      const filename = `${applicantName.toLowerCase().replace(/\s+/g, '_')}_noc_certificate.pdf`;
      onSaveHistory({
        id: 'noc-' + Date.now(),
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ''),
        section: 'noc',
        title: applicantName || nocFields.companyName || 'NOC Certificate',
        type: 'noc-pdf',
        filename: filename,
        nocFields: { ...nocFields },
        nocCategory: selectedCategory,
        nocBody: nocBody,
        nocSealImage: sealImage || undefined,
        nocSealPos: sealPos,
        nocSealSize: sealSize,
        nocPadStyle: padStyle,
      });
    }
  };

  return (
    <motion.div
      key="noc-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="p-2 sm:p-4 md:p-6 space-y-4 w-full max-w-7xl mx-auto font-sans"
    >
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-700 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                NOC Certificate Generator
              </h2>
              <span className="text-[10.5px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                {selectedCategory}
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Generate official company No Objection Certificate on company letterhead pad
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Mobile Form/Preview Toggle */}
          <div className="lg:hidden flex items-center p-0.5 rounded-lg bg-neutral-100 border border-neutral-200">
            <button
              type="button"
              onClick={() => setMobileView('form')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                mobileView === 'form' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                mobileView === 'preview' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleSmartFill}
            disabled={isSmartFilling}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Intelligently write NOC content with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSmartFilling ? 'Generating...' : 'Smart Fill AI'}</span>
          </button>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="bg-black/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-emerald-600 hover:bg-emerald-500 border-b-3 border-black/20 active:border-b-0 active:translate-y-[2px] text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: SIMPLIFIED 3-STEP CONTROL PANEL */}
        <div className={`lg:col-span-5 flex flex-col bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden ${
          mobileView === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Step Selector Header */}
          <div className="p-3 bg-neutral-50/90 border-b border-neutral-200">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-200/70 rounded-xl">
              <button
                type="button"
                id="noc-step-applicant"
                onClick={() => setActiveStep('applicant')}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeStep === 'applicant'
                    ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
                  activeStep === 'applicant' ? 'bg-indigo-600 text-white' : 'bg-neutral-400 text-white'
                }`}>
                  1
                </span>
                <span className="truncate">Applicant</span>
              </button>

              <button
                type="button"
                id="noc-step-company"
                onClick={() => setActiveStep('company')}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeStep === 'company'
                    ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
                  activeStep === 'company' ? 'bg-indigo-600 text-white' : 'bg-neutral-400 text-white'
                }`}>
                  2
                </span>
                <span className="truncate">Company & Pad</span>
              </button>

              <button
                type="button"
                id="noc-step-letter"
                onClick={() => setActiveStep('letter')}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeStep === 'letter'
                    ? 'bg-white text-neutral-900 shadow-sm border border-neutral-300'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
                  activeStep === 'letter' ? 'bg-emerald-600 text-white' : 'bg-neutral-400 text-white'
                }`}>
                  3
                </span>
                <span className="truncate">Letter & Export</span>
              </button>
            </div>
          </div>

          {/* Step Form Content */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[750px]">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: APPLICANT & PURPOSE */}
              {activeStep === 'applicant' && (
                <motion.div
                  key="step-applicant"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Category Pills */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                      NOC Purpose / Category *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {NOC_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setNocFields((prev) => ({ ...prev, purposeCategory: cat }));
                          }}
                          className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-300/40 shadow-xs'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Applicant Details */}
                  <div className="pt-2 border-t border-neutral-200 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 font-mono uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Applicant Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={nocFields.applicantName}
                          onChange={(e) => handleFieldChange('applicantName', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.applicantName}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Designation / Role
                        </label>
                        <input
                          type="text"
                          value={nocFields.designation}
                          onChange={(e) => handleFieldChange('designation', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.designation}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Gender
                        </label>
                        <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleFieldChange('gender', 'male')}
                            className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              (nocFields.gender || 'male') === 'male'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            Male
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldChange('gender', 'female')}
                            className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              nocFields.gender === 'female'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            Female
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Passport / NID No
                        </label>
                        <input
                          type="text"
                          value={nocFields.passportNo}
                          onChange={(e) => handleFieldChange('passportNo', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.passportNo}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Date of Joining
                        </label>
                        <input
                          type="text"
                          value={nocFields.joiningDate}
                          onChange={(e) => handleFieldChange('joiningDate', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.joiningDate}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Travel Details */}
                  <div className="pt-2 border-t border-neutral-200 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 font-mono uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Travel & Leave Duration</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Destination Country / Location
                        </label>
                        <input
                          type="text"
                          value={nocFields.destinationCountry}
                          onChange={(e) => handleFieldChange('destinationCountry', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.destinationCountry}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none font-bold bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Leave Start Date
                        </label>
                        <input
                          type="text"
                          value={nocFields.leaveFrom}
                          onChange={(e) => handleFieldChange('leaveFrom', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.leaveFrom}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Leave End Date
                        </label>
                        <input
                          type="text"
                          value={nocFields.leaveTo}
                          onChange={(e) => handleFieldChange('leaveTo', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.leaveTo}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none bg-neutral-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Footer Navigation */}
                  <div className="pt-3 border-t border-neutral-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep('company')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Continue to Company & Pad</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: COMPANY & PAD STYLE */}
              {activeStep === 'company' && (
                <motion.div
                  key="step-company"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Organization & Signatory */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 font-mono uppercase tracking-wider">
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Company Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Ref No
                        </label>
                        <input
                          type="text"
                          value={nocFields.refNo}
                          onChange={(e) => handleFieldChange('refNo', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.refNo}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Issue Date
                        </label>
                        <input
                          type="text"
                          value={nocFields.issueDate}
                          onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.issueDate}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={nocFields.companyName}
                          onChange={(e) => handleFieldChange('companyName', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.companyName}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none font-bold bg-neutral-50/50"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Company Address
                        </label>
                        <input
                          type="text"
                          value={nocFields.companyAddress}
                          onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.companyAddress}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Signatory Name (Authority)
                        </label>
                        <input
                          type="text"
                          value={nocFields.signatoryName}
                          onChange={(e) => handleFieldChange('signatoryName', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.signatoryName}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold block mb-1">
                          Signatory Title
                        </label>
                        <input
                          type="text"
                          value={nocFields.signatoryTitle}
                          onChange={(e) => handleFieldChange('signatoryTitle', e.target.value)}
                          placeholder={DEMO_NOC_FIELDS.signatoryTitle}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-neutral-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Letterhead Pad Format */}
                  <div className="pt-2 border-t border-neutral-200 space-y-2">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                      Letterhead Pad Header Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: 'standard', label: 'Standard Bar' },
                        { id: 'classic', label: 'Classic Centered' },
                        { id: 'minimal', label: 'Left Minimal' },
                        { id: 'right-aligned', label: 'Right Aligned' },
                        { id: 'professional', label: 'Professional' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setPadStyle(style.id as any)}
                          className={`px-2.5 py-2 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                            padStyle === style.id
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-300/40 shadow-xs'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Company Seal (সিল) Attachment */}
                  <div className="pt-2 border-t border-neutral-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Stamp className="w-3.5 h-3.5 text-violet-600" />
                        Company Seal / Stamp (সিল)
                      </span>
                      {sealImage && (
                        <button
                          type="button"
                          onClick={() => setSealImage(null)}
                          className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                        >
                          Remove Seal
                        </button>
                      )}
                    </div>

                    <input
                      ref={sealInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSealUpload}
                      className="hidden"
                    />

                    {!sealImage ? (
                      <button
                        type="button"
                        onClick={() => sealInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-violet-300 hover:border-violet-500 bg-violet-50/50 hover:bg-violet-50 rounded-xl text-violet-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-violet-600" />
                        <span>Attach Official Seal (সিল সংযুক্ত করুন)</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-violet-50/60 border border-violet-200 rounded-xl flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={sealImage}
                            alt="Seal"
                            className="w-12 h-12 object-contain bg-white border border-violet-200 rounded-lg p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-violet-950 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                              <span>Seal Active & Positioned</span>
                            </span>
                            <span className="text-[10px] text-violet-700 font-mono">
                              Sincerely-এর পাশে স্বয়ংক্রিয়ভাবে বসেছে
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => sealInputRef.current?.click()}
                            className="text-[11px] font-bold text-violet-800 bg-white border border-violet-200 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Change
                          </button>
                        </div>

                        {/* Seal Size Slider */}
                        <div className="flex items-center justify-between gap-3 text-xs bg-white p-2 rounded-lg border border-violet-200">
                          <span className="text-[10.5px] font-mono text-neutral-500 uppercase font-semibold">
                            Seal Size:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSealSize((s) => Math.max(80, s - 15))}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] font-mono font-bold text-violet-900 w-12 text-center">
                              {sealSize}px
                            </span>
                            <button
                              type="button"
                              onClick={() => setSealSize((s) => Math.min(260, s + 15))}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2 Footer Navigation */}
                  <div className="pt-3 border-t border-neutral-200 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep('applicant')}
                      className="text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStep('letter')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Continue to Letter & Export</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: LETTER CONTENT & EXPORT */}
              {activeStep === 'letter' && (
                <motion.div
                  key="step-letter"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Text Editor Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                        NOC Letter Content
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopyText}
                          className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetBody}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={nocBody}
                      onChange={(e) => handleBodyChange(e.target.value)}
                      rows={10}
                      className="w-full p-3 border border-neutral-300 rounded-xl text-xs sm:text-[13px] text-neutral-800 leading-relaxed font-serif bg-[#FDFDFD] focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none resize-y shadow-xs"
                      placeholder="Type or modify your NOC letter text here..."
                    />
                  </div>

                  {/* Primary Download Box */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">Official NOC Ready for Download</h4>
                        <p className="text-[10.5px] text-emerald-700 font-mono">Standard print-ready A4 PDF with official pad styling & seal</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-download-noc-pdf"
                      onClick={handleDownloadPDF}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 border-b-3 border-black/20 active:border-b-0 active:translate-y-[2px] text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Official NOC PDF</span>
                    </button>
                  </div>

                  {/* Step 3 Footer Navigation */}
                  <div className="pt-3 border-t border-neutral-200 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep('company')}
                      className="text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Company & Pad</span>
                    </button>

                    {onOpenHistory && (
                      <button
                        type="button"
                        onClick={onOpenHistory}
                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>View Saved NOCs</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN REAL-TIME A4 DOCUMENT PREVIEW */}
        <div className={`lg:col-span-7 flex flex-col items-center ${
          mobileView === 'form' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Document Container */}
          <div
            ref={documentRef}
            className={`w-full max-w-[620px] bg-white rounded-xl border border-neutral-300 shadow-xl p-6 sm:p-10 min-h-[780px] flex flex-col justify-between relative overflow-hidden font-serif ${
              padStyle === 'standard' || padStyle === 'professional' ? '' : 'pt-10 sm:pt-12'
            }`}
          >
            {/* Header Rendering based on padStyle */}
            {padStyle === 'standard' && (
              <>
                <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundColor: theme?.primary || '#1E293B' }} />
                <div className="absolute top-3 left-0 right-0 h-1" style={{ backgroundColor: theme?.accent || '#C5A880' }} />
                <div className="border-b-2 border-neutral-200 pb-4 mb-5 pt-3 select-none text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans uppercase m-0 leading-tight" style={{ color: theme?.primary || '#1E293B' }}>
                    {nocFields.companyName || 'ACME CORPORATION'}
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 font-sans mt-1 leading-relaxed">
                    {nocFields.companyAddress || '123 Business Avenue, Suite 400'}
                    {nocFields.companyPhone ? ` • Tel: ${nocFields.companyPhone}` : ''}
                    {nocFields.companyEmail ? ` • Email: ${nocFields.companyEmail}` : ''}
                  </p>
                </div>
              </>
            )}

            {padStyle === 'classic' && (
              <div className="border-b border-neutral-400 pb-5 mb-5 select-none text-center">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-widest font-serif uppercase m-0 leading-tight" style={{ color: theme?.primary || '#1E293B' }}>
                  {nocFields.companyName || 'ACME CORPORATION'}
                </h1>
                <div className="w-16 h-0.5 mx-auto mt-2.5 mb-2" style={{ backgroundColor: theme?.primary || '#1E293B' }} />
                <p className="text-xs sm:text-sm text-neutral-700 font-serif leading-relaxed italic">
                  {nocFields.companyAddress || '123 Business Avenue, Suite 400'}
                </p>
                <p className="text-[11px] text-neutral-500 font-serif mt-0.5">
                  {nocFields.companyPhone ? `Tel: ${nocFields.companyPhone}` : ''}
                  {nocFields.companyPhone && nocFields.companyEmail ? ` | ` : ''}
                  {nocFields.companyEmail ? `Email: ${nocFields.companyEmail}` : ''}
                </p>
              </div>
            )}

            {padStyle === 'minimal' && (
              <div className="border-b border-neutral-200 pb-4 mb-5 select-none text-left">
                <h1 className="text-2xl font-bold tracking-tight font-sans uppercase m-0 leading-tight" style={{ color: theme?.primary || '#1E293B' }}>
                  {nocFields.companyName || 'ACME CORPORATION'}
                </h1>
                <p className="text-xs text-neutral-500 font-sans mt-1 leading-relaxed">
                  {nocFields.companyAddress || '123 Business Avenue, Suite 400'}
                </p>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  {nocFields.companyPhone ? `T: ${nocFields.companyPhone}` : ''}
                  {nocFields.companyPhone && nocFields.companyEmail ? ` • ` : ''}
                  {nocFields.companyEmail ? `E: ${nocFields.companyEmail}` : ''}
                </p>
              </div>
            )}

            {padStyle === 'right-aligned' && (
              <div className="border-b-2 pb-4 mb-5 select-none text-right flex flex-col items-end" style={{ borderBottomColor: theme?.primary || '#1E293B' }}>
                <h1 className="text-2xl font-black tracking-tighter font-sans uppercase m-0 leading-tight" style={{ color: theme?.primary || '#1E293B' }}>
                  {nocFields.companyName || 'ACME CORPORATION'}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 font-sans mt-1 leading-relaxed max-w-sm">
                  {nocFields.companyAddress || '123 Business Avenue, Suite 400'}
                </p>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">
                  {nocFields.companyPhone ? `P: ${nocFields.companyPhone}` : ''}
                  {nocFields.companyPhone && nocFields.companyEmail ? ` | ` : ''}
                  {nocFields.companyEmail ? `E: ${nocFields.companyEmail}` : ''}
                </p>
              </div>
            )}

            {padStyle === 'professional' && (
              <>
                <div className="absolute top-0 left-0 right-0 h-3.5" style={{ backgroundColor: theme?.primary || '#1E293B' }} />
                <div className="border-b-4 pb-4 mb-5 pt-4 select-none flex justify-between items-end" style={{ borderBottomColor: theme?.primary || '#1E293B' }}>
                  <div className="text-left max-w-[60%]">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-normal font-serif uppercase m-0 leading-tight" style={{ color: theme?.primary || '#1E293B' }}>
                      {nocFields.companyName || 'ACME CORPORATION'}
                    </h1>
                  </div>
                  <div className="text-right text-[11px] text-neutral-600 font-sans leading-tight space-y-0.5 max-w-[40%]">
                    <p>{nocFields.companyAddress || '123 Business Avenue, Suite 400'}</p>
                    <p>{nocFields.companyPhone ? `Phone: ${nocFields.companyPhone}` : ''}</p>
                    <p>{nocFields.companyEmail ? `Email: ${nocFields.companyEmail}` : ''}</p>
                  </div>
                </div>
              </>
            )}

            {/* Document Content Rendering */}
            <div className="flex-1 space-y-4 relative z-10">
              {(() => {
                const { before, after, hasSplit } = splitNocBody(nocBody);
                return hasSplit ? (
                  <div className="space-y-4">
                    <div
                      className="whitespace-pre-wrap text-sm sm:text-base text-neutral-900 leading-relaxed font-serif"
                      dangerouslySetInnerHTML={{
                        __html: before
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/&lt;b&gt;/g, '<strong class="font-bold text-neutral-950">')
                          .replace(/&lt;\/b&gt;/g, '</strong>')
                      }}
                    />
                    <div className="relative pt-2">
                      {sealImage && (
                        <div
                          onPointerDown={handleSealPointerDown}
                          onPointerMove={handleSealPointerMove}
                          onPointerUp={handleSealPointerUp}
                          className="absolute z-30 cursor-grab active:cursor-grabbing select-none group/seal"
                          style={{
                            left: '26%',
                            top: '-15px',
                            transform: `translate(${sealPos.x}px, ${sealPos.y}px)`,
                            width: `${sealSize}px`,
                            touchAction: 'none',
                          }}
                        >
                          <img
                            src={sealImage}
                            alt="Company Seal"
                            className="w-full h-auto object-contain opacity-95 mix-blend-multiply filter contrast-125"
                            draggable={false}
                          />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/seal:opacity-100 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap transition-opacity font-sans">
                            Drag Seal to Adjust Position
                          </div>
                        </div>
                      )}
                      <div
                        className="whitespace-pre-wrap text-sm sm:text-base text-neutral-900 leading-relaxed font-serif relative z-10"
                        dangerouslySetInnerHTML={{
                          __html: after
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/&lt;b&gt;/g, '<strong class="font-bold text-neutral-950">')
                            .replace(/&lt;\/b&gt;/g, '</strong>')
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {sealImage && (
                      <div
                        onPointerDown={handleSealPointerDown}
                        onPointerMove={handleSealPointerMove}
                        onPointerUp={handleSealPointerUp}
                        className="absolute z-30 cursor-grab active:cursor-grabbing select-none group/seal"
                        style={{
                          left: '26%',
                          bottom: '60px',
                          transform: `translate(${sealPos.x}px, ${sealPos.y}px)`,
                          width: `${sealSize}px`,
                          touchAction: 'none',
                        }}
                      >
                        <img
                          src={sealImage}
                          alt="Company Seal"
                          className="w-full h-auto object-contain opacity-95 mix-blend-multiply filter contrast-125"
                          draggable={false}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/seal:opacity-100 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap transition-opacity font-sans">
                          Drag Seal to Adjust Position
                        </div>
                      </div>
                    )}
                    <div
                      className="whitespace-pre-wrap text-sm sm:text-base text-neutral-900 leading-relaxed font-serif bg-white/90"
                      dangerouslySetInnerHTML={{
                        __html: nocBody
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/&lt;b&gt;/g, '<strong class="font-bold text-neutral-950">')
                          .replace(/&lt;\/b&gt;/g, '</strong>')
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Bottom Company Pad Footer */}
            {(padStyle === 'standard' || padStyle === 'professional') && (
              <div
                className="mt-8 h-2.5 rounded-b-lg -mx-6 -mb-6 sm:-mx-10 sm:-mb-10"
                style={{ backgroundColor: theme?.primary || '#1E293B' }}
              />
            )}
            {padStyle === 'minimal' && (
              <div className="mt-8 border-t border-neutral-200 pt-3 text-center text-[10px] text-neutral-400 font-sans uppercase tracking-widest">
                {nocFields.companyName || 'ACME CORPORATION'}
              </div>
            )}
            {padStyle === 'classic' && (
              <div className="mt-8 border-t pt-2.5 text-center text-xs font-serif italic" style={{ borderTopColor: theme?.primary || '#1E293B', color: theme?.primary || '#1E293B' }}>
                End of Document
              </div>
            )}
            {padStyle === 'right-aligned' && (
              <div className="mt-8 border-t-2 pt-2.5 text-right text-xs font-sans font-bold" style={{ borderTopColor: theme?.primary || '#1E293B', color: theme?.primary || '#1E293B' }}>
                {nocFields.companyName || 'ACME CORPORATION'}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
