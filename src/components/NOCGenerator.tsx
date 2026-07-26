import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Building,
  User,
  CreditCard,
  Calendar,
  Briefcase,
  MapPin,
  Award,
  Download,
  Copy,
  RotateCcw,
  Eye,
  Edit3,
  History,
  Stamp,
  Upload,
  Move,
  Trash2,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Scaling,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const [nocMode, setNocMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState<boolean>(false);

  // Seal / Stamp states & refs
  const [sealImage, setSealImage] = useState<string | null>(null);
  const [sealPos, setSealPos] = useState<{ x: number; y: number }>({ x: 340, y: 520 });
  const [sealSize, setSealSize] = useState<number>(190);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const sealInputRef = useRef<HTMLInputElement | null>(null);
  const documentRef = useRef<HTMLDivElement | null>(null);

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = sealSize;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const maxDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      const newSize = Math.max(50, Math.min(320, startSize + maxDelta));
      setSealSize(newSize);
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

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

    generateNOCPDF(selectedCategory, nocFields, nocBody, theme, sealData);

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
      });
    }
  };

  return (
    <motion.div
      key="noc-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="p-2 sm:p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto"
    >
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-800 m-0">
              NOC Generator
            </h2>
            
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Edit / Preview Mode Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-100 border border-neutral-200 gap-1">
            <button
              type="button"
              onClick={() => setNocMode('preview')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                nocMode === 'preview'
                  ? 'bg-teal-600 text-white border-b-[3px] border-black/30 shadow-md ring-2 ring-teal-400 ring-offset-1'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setNocMode('edit')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                nocMode === 'edit'
                  ? 'bg-emerald-600 text-white border-b-[3px] border-black/30 shadow-md ring-2 ring-emerald-400 ring-offset-1'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block mx-1" />

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="bg-amber-500 hover:bg-amber-400 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
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
            type="button"
            onClick={handleCopyText}
            className="bg-indigo-600 hover:bg-indigo-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            type="button"
            onClick={handleResetBody}
            className="bg-rose-600 hover:bg-rose-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            title="Reset to original template text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Panel */}
        <div className={`space-y-4 lg:col-span-5 ${nocMode === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Category Selector */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-neutral-200 shadow-xs space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 titlecase tracking-wider block">
              NOC Purpose / Category:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {NOC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setNocFields((prev) => ({ ...prev, purposeCategory: cat }));
                  }}
                  className={`px-2 py-1.5 text-[11px] font-bold rounded-md border text-center flex items-center justify-center transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Employee & Applicant Details */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-neutral-200 shadow-xs space-y-2.5">
            <h3 className="text-[10px] font-bold text-neutral-500 titlecase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Applicant Information:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nocFields.applicantName}
                  onChange={(e) => handleFieldChange('applicantName', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.applicantName}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={nocFields.designation}
                  onChange={(e) => handleFieldChange('designation', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.designation}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-100 border border-neutral-200 rounded-md">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('gender', 'male')}
                    className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      (nocFields.gender || 'male') === 'male'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('gender', 'female')}
                    className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      nocFields.gender === 'female'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Passport / NID No
                </label>
                <input
                  type="text"
                  value={nocFields.passportNo}
                  onChange={(e) => handleFieldChange('passportNo', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.passportNo}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Date of Joining
                </label>
                <input
                  type="text"
                  value={nocFields.joiningDate}
                  onChange={(e) => handleFieldChange('joiningDate', e.target.value)}
                  placeholder={DEMO_NOC_FIELDS.joiningDate}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Travel / Purpose / Duration Details */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-neutral-200 shadow-xs space-y-2.5">
            <h3 className="text-[10px] font-bold text-neutral-500 titlecase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Travel & Purpose Details:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Country / Location
                </label>
                <input
                  type="text"
                  value={nocFields.destinationCountry}
                  onChange={(e) => handleFieldChange('destinationCountry', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none font-bold"
                  placeholder={DEMO_NOC_FIELDS.destinationCountry}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Leave Start Date
                </label>
                <input
                  type="text"
                  value={nocFields.leaveFrom}
                  onChange={(e) => handleFieldChange('leaveFrom', e.target.value)}
                  placeholder={DEMO_NOC_FIELDS.leaveFrom}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Leave End Date
                </label>
                <input
                  type="text"
                  value={nocFields.leaveTo}
                  onChange={(e) => handleFieldChange('leaveTo', e.target.value)}
                  placeholder={DEMO_NOC_FIELDS.leaveTo}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Company & Signatory Details */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-neutral-200 shadow-xs space-y-2.5">
            <h3 className="text-[10px] font-bold text-neutral-500 titlecase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              Organization & Signatory Details:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Ref No
                </label>
                <input
                  type="text"
                  value={nocFields.refNo}
                  onChange={(e) => handleFieldChange('refNo', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.refNo}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Issue Date
                </label>
                <input
                  type="text"
                  value={nocFields.issueDate}
                  onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                  placeholder={DEMO_NOC_FIELDS.issueDate}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={nocFields.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none font-bold"
                  placeholder={DEMO_NOC_FIELDS.companyName}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Company Address
                </label>
                <input
                  type="text"
                  value={nocFields.companyAddress}
                  onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.companyAddress}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Mobile / Phone Number
                </label>
                <input
                  type="text"
                  value={nocFields.companyPhone}
                  onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.companyPhone}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Company Email
                </label>
                <input
                  type="email"
                  value={nocFields.companyEmail}
                  onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.companyEmail}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={nocFields.signatoryName}
                  onChange={(e) => handleFieldChange('signatoryName', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.signatoryName}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-600 block mb-0.5">
                  Signatory Title
                </label>
                <input
                  type="text"
                  value={nocFields.signatoryTitle}
                  onChange={(e) => handleFieldChange('signatoryTitle', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder={DEMO_NOC_FIELDS.signatoryTitle}
                />
              </div>
            </div>
          </div>

          {/* Company Seal / Stamp Attachment Card */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-neutral-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b pb-1">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-violet-600" />
                Company Seal (সিল):
              </h3>
              {sealImage && (
                <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-violet-600" /> Attached
                </span>
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
                className="w-full py-3 px-4 border-2 border-dashed border-violet-400 hover:border-violet-600 bg-violet-50/80 hover:bg-violet-100/70 text-violet-700 hover:text-violet-800 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 group shadow-xs"
              >
                <Upload className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
                <span>Attach Seal Image (সিল আপলোড করুন)</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                  <div className="w-12 h-12 rounded border bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img src={sealImage} alt="Seal Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-800 truncate">Official Stamp Attached</p>
                    <p className="text-[10px] text-violet-600 font-medium">
                      ডকুমেন্টের নির্ধারিত স্থানে (Sincerely-এর পাশে) সিলটি স্বয়ংক্রিয়ভাবে বসে যাবে
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSealImage(null)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Seal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Size & Controls */}
                <div className="flex items-center justify-between gap-2 text-xs bg-neutral-100 p-2 rounded-lg">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase">Seal Size:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSealSize((s) => Math.max(60, s - 15))}
                      className="p-1 bg-white hover:bg-neutral-200 border rounded font-bold text-neutral-700 cursor-pointer text-xs flex items-center justify-center"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-neutral-700 w-10 text-center">
                      {sealSize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => setSealSize((s) => Math.min(250, s + 15))}
                      className="p-1 bg-white hover:bg-neutral-200 border rounded font-bold text-neutral-700 cursor-pointer text-xs flex items-center justify-center"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Editor / Document Preview Stage */}
        <div className={`space-y-4 lg:col-span-7 ${nocMode === 'edit' ? 'block' : 'col-span-12'}`}>
          <div
            ref={documentRef}
            className="bg-white rounded-xl border border-neutral-300 shadow-xl p-8 sm:p-12 min-h-[700px] flex flex-col justify-between relative overflow-hidden font-serif"
          >
            {/* Top Company Pad Accent Bars */}
            <div
              className="absolute top-0 left-0 right-0 h-3"
              style={{ backgroundColor: theme?.primary || '#1E293B' }}
            />
            <div
              className="absolute top-3 left-0 right-0 h-1"
              style={{ backgroundColor: theme?.accent || '#C5A880' }}
            />

            {/* Official Company Pad Letterhead Header */}
            <div className="border-b-2 border-neutral-200 pb-5 mb-6 pt-3 select-none text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-sans uppercase m-0 leading-tight">
                {nocFields.companyName || 'ACME CORPORATION'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 font-sans mt-1 leading-relaxed">
                {nocFields.companyAddress || '123 Business Avenue, Suite 400'}
                {nocFields.companyPhone ? ` • Tel: ${nocFields.companyPhone}` : ''}
                {nocFields.companyEmail ? ` • Email: ${nocFields.companyEmail}` : ''}
              </p>
            </div>

            {/* Document Content / Live Textarea */}
            <div className="flex-1 space-y-4 relative z-10">
              {nocMode === 'edit' ? (
                <div>
                  <div className="flex items-center justify-between mb-2 select-none">
                    <span className="text-xs font-bold font-sans text-neutral-500 uppercase tracking-wider">
                      Company Pad NOC Content (Editable)
                    </span>
                    {isManualEdit && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-sans font-bold px-2 py-0.5 rounded">
                        Customized Body
                      </span>
                    )}
                  </div>
                  <textarea
                    value={nocBody}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    rows={18}
                    className="w-full p-4 border border-neutral-200 rounded-lg text-sm sm:text-base text-neutral-800 leading-relaxed font-serif bg-white/80 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none shadow-xs"
                    placeholder="Type or modify your NOC text here..."
                  />
                </div>
              ) : (() => {
                const { before, after, hasSplit } = splitNocBody(nocBody);
                return hasSplit ? (
                  <div className="space-y-6">
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
                          className="absolute z-20 pointer-events-none select-none transition-all"
                          style={{
                            left: '26%',
                            top: '-15px',
                            width: `${sealSize}px`,
                          }}
                        >
                          <img
                            src={sealImage}
                            alt="Company Seal"
                            className="w-full h-auto object-contain opacity-95 mix-blend-multiply filter contrast-125 rotate-[-3deg]"
                          />
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
                        className="absolute z-20 pointer-events-none select-none transition-all"
                        style={{
                          left: '26%',
                          bottom: '60px',
                          width: `${sealSize}px`,
                        }}
                      >
                        <img
                          src={sealImage}
                          alt="Company Seal"
                          className="w-full h-auto object-contain opacity-95 mix-blend-multiply filter contrast-125 rotate-[-3deg]"
                        />
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
            <div
              className="mt-8 h-3 rounded-b-lg -mx-8 -mb-8 sm:-mx-12 sm:-mb-12"
              style={{ backgroundColor: theme?.primary || '#1E293B' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
