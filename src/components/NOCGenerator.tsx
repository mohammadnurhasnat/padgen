import React, { useState, useEffect } from 'react';
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

interface NOCGeneratorProps {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  theme?: Theme;
  onSaveHistory?: (item: HistoryItem) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  lastLoadedItem?: HistoryItem | null;
}

export const NOCGenerator: React.FC<NOCGeneratorProps> = ({
  companyData,
  setCompanyData,
  theme,
  onSaveHistory,
  onOpenHistory,
  historyCount = 0,
  lastLoadedItem,
}) => {
  const [nocFields, setNocFields] = useState<NOCFields>(DEFAULT_NOC_FIELDS);
  const [selectedCategory, setSelectedCategory] = useState<NOCCategory>('Tourist');
  const [nocBody, setNocBody] = useState<string>('');
  const [isManualEdit, setIsManualEdit] = useState<boolean>(false);
  const [nocMode, setNocMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState<boolean>(false);

  // Restore fields when a history item is loaded
  useEffect(() => {
    if (lastLoadedItem && lastLoadedItem.section === 'noc') {
      if (lastLoadedItem.nocFields) setNocFields(lastLoadedItem.nocFields);
      if (lastLoadedItem.nocCategory) setSelectedCategory(lastLoadedItem.nocCategory as NOCCategory);
      if (lastLoadedItem.nocBody) {
        setNocBody(lastLoadedItem.nocBody);
        setIsManualEdit(true);
      }
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
    generateNOCPDF(selectedCategory, nocFields, nocBody, theme);

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
        </div>

        {/* Right Live Editor / Document Preview Stage */}
        <div className={`space-y-4 lg:col-span-7 ${nocMode === 'edit' ? 'block' : 'col-span-12'}`}>
          <div className="bg-white rounded-xl border border-neutral-300 shadow-xl p-8 sm:p-12 min-h-[700px] flex flex-col justify-between relative overflow-hidden font-serif">
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
              ) : (
                <div
                  className="whitespace-pre-wrap text-sm sm:text-base text-neutral-900 leading-relaxed font-serif p-4 bg-white/90"
                  dangerouslySetInnerHTML={{
                    __html: nocBody
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/&lt;b&gt;/g, '<strong class="font-bold text-neutral-950">')
                      .replace(/&lt;\/b&gt;/g, '</strong>')
                  }}
                />
              )}
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
