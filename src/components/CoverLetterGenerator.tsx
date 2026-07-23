import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  User,
  CreditCard,
  Calendar,
  Briefcase,
  Heart,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CompanyData, Theme } from '../types';
import {
  CoverLetterFields,
  DEFAULT_COVER_LETTER_FIELDS,
  VISA_CATEGORIES,
  VisaCategory,
} from '../types/coverLetter';
import { generateTemplateText, generateCoverLetterPDF } from '../utils/coverLetterUtils';

interface CoverLetterGeneratorProps {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  theme?: Theme;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
  companyData,
  setCompanyData,
  theme,
}) => {
  const [coverFields, setCoverFields] = useState<CoverLetterFields>(DEFAULT_COVER_LETTER_FIELDS);
  const [selectedCategory, setSelectedCategory] = useState<VisaCategory>('Tourist Visa');
  const [letterBody, setLetterBody] = useState<string>('');
  const [isManualEdit, setIsManualEdit] = useState<boolean>(false);
  const [coverMode, setCoverMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState<boolean>(false);

  // Synchronize companyData (Pad & Card section) to coverFields (Cover Letter section)
  useEffect(() => {
    setCoverFields((prev) => ({
      ...prev,
      companyName: companyData.companyName || prev.companyName,
      applicantName: companyData.empName || prev.applicantName,
      designation: companyData.empRole || prev.designation,
      referenceAddress: companyData.address || prev.referenceAddress,
    }));
  }, [companyData.companyName, companyData.empName, companyData.empRole, companyData.address]);

  // Auto-fill template if not manually customized yet
  useEffect(() => {
    if (!isManualEdit) {
      setLetterBody(generateTemplateText(selectedCategory, coverFields));
    }
  }, [coverFields, selectedCategory, isManualEdit]);

  const handleCoverFieldChange = (key: keyof CoverLetterFields, value: string) => {
    setCoverFields((prev) => ({ ...prev, [key]: value }));
    if (key === 'companyName') setCompanyData((prev) => ({ ...prev, companyName: value }));
    if (key === 'applicantName') setCompanyData((prev) => ({ ...prev, empName: value }));
    if (key === 'designation') setCompanyData((prev) => ({ ...prev, empRole: value }));
    if (key === 'referenceAddress') setCompanyData((prev) => ({ ...prev, address: value }));
  };

  const handleLetterBodyChange = (value: string) => {
    setIsManualEdit(true);
    setLetterBody(value);
  };

  const handleResetLetter = () => {
    setIsManualEdit(false);
    setLetterBody(generateTemplateText(selectedCategory, coverFields));
  };

  const handleCopyLetterText = async () => {
    try {
      await navigator.clipboard.writeText(letterBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadPDF = () => {
    generateCoverLetterPDF(coverFields, companyData, letterBody);
  };

  const primaryColor = theme?.primary || '#059669';

  return (
    <motion.div
      key="cover-letter-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="p-4 md:p-8 space-y-6"
    >
      {/* Dynamic Action bar for Cover Letter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-[var(--coral-light)] text-[var(--coral-accent)]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-800 m-0">
              {coverMode === 'edit' ? 'Drafting Space' : 'Document Preview'}
            </h2>
          </div>
        </div>

        {/* Sub-action controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Edit/Preview Toggle Pill */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-100 border border-neutral-200 gap-1">
            <button
              onClick={() => setCoverMode('preview')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                coverMode === 'preview'
                  ? 'bg-teal-600 text-white border-b-2 border-teal-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Preview Mode
            </button>
            <button
              onClick={() => setCoverMode('edit')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                coverMode === 'edit'
                  ? 'bg-sky-600 text-white border-b-2 border-sky-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Edit Mode
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block mx-1" />

          {/* Quick-copy and reset templates */}
          <button
            onClick={handleCopyLetterText}
            className="bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-900 shadow-md text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer active:translate-y-[2px] active:border-b-2 transition-all"
          >
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            onClick={handleResetLetter}
            className="bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-900 shadow-md text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer active:translate-y-[2px] active:border-b-2 transition-all"
            title="Reset back to generated template body"
          >
            Reset
          </button>

          <button
            onClick={() => {
              try {
                window.print();
              } catch (e) {
                alert('Printing blocked in preview. Please open in a new tab.');
              }
            }}
            className="bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-900 shadow-md text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer active:translate-y-[2px] active:border-b-2 transition-all"
          >
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-900 shadow-md text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer active:translate-y-[2px] active:border-b-2 transition-all"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* DUAL MODE SPLIT FOR COVER LETTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mode: Edit layout inputs */}
        {coverMode === 'edit' && (
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-xl shadow-xs border border-neutral-200 bg-white transition-colors duration-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[var(--ui-accent)]" />
                <h2 className="text-base font-bold text-neutral-900">Document Fields</h2>
              </div>

              {/* Visa Category Template Selector */}
              <div className="mb-5">
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-neutral-500">
                  Visa Category Template
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as VisaCategory);
                    setIsManualEdit(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border text-sm font-semibold transition-colors bg-white border-neutral-200 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--ui-accent)] focus:border-[var(--ui-accent)]"
                >
                  {VISA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic fields grid */}
              <div className="space-y-4">
                <div className="border-t pt-4 border-neutral-100">
                  <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">
                    Applicant & Travel Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      value={coverFields.applicantName}
                      onChange={(e) => handleCoverFieldChange('applicantName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                      placeholder="e.g. Ameer Ali"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={coverFields.passportNumber}
                      onChange={(e) => handleCoverFieldChange('passportNumber', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                      placeholder="e.g. EG0876543"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={coverFields.dob}
                      onChange={(e) => handleCoverFieldChange('dob', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Letter Date
                    </label>
                    <input
                      type="date"
                      value={coverFields.letterDate}
                      onChange={(e) => handleCoverFieldChange('letterDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 border-neutral-100">
                  <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">
                    Employment Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={coverFields.companyName}
                      onChange={(e) => handleCoverFieldChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                      placeholder="e.g. Apex Solutions Ltd."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                      Designation
                    </label>
                    <input
                      type="text"
                      value={coverFields.designation}
                      onChange={(e) => handleCoverFieldChange('designation', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                      placeholder="e.g. Lead Developer"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={coverFields.joiningDate}
                    onChange={(e) => handleCoverFieldChange('joiningDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                  />
                </div>

                <div className="border-t pt-4 border-neutral-100">
                  <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">
                    Travel & References
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Travel From
                    </label>
                    <input
                      type="date"
                      value={coverFields.travelFromDate}
                      onChange={(e) => handleCoverFieldChange('travelFromDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Travel To
                    </label>
                    <input
                      type="date"
                      value={coverFields.travelToDate}
                      onChange={(e) => handleCoverFieldChange('travelToDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                    />
                  </div>
                </div>

                {selectedCategory === 'Medical Attendant Visa' && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                      <Heart className="w-3.5 h-3.5 text-[var(--ui-accent)]" />
                      Patient Name & Info
                    </label>
                    <input
                      type="text"
                      value={coverFields.patientInfo}
                      onChange={(e) => handleCoverFieldChange('patientInfo', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:border-[var(--ui-accent)]"
                      placeholder="e.g. Yusuf Ali"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-neutral-600">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Indian Reference / Hotel Address
                  </label>
                  <textarea
                    rows={2}
                    value={coverFields.referenceAddress}
                    onChange={(e) => handleCoverFieldChange('referenceAddress', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-colors bg-white border-neutral-200 text-neutral-800 focus:ring-1 focus:ring-[var(--ui-accent)] focus:outline-none focus:border-[var(--ui-accent)]"
                    placeholder="e.g. Apollo Gleneagles Hospital, Kolkata"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Interactive Paper preview & drafting */}
        <div
          className={`${
            coverMode === 'edit' ? 'lg:col-span-7' : 'lg:col-span-12'
          } flex flex-col items-center`}
        >
          <div className="mb-3 text-xs font-medium flex items-center gap-1.5 text-neutral-500 print:hidden select-none">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>A4 Cover Letter Live Canvas (Directly Typeable)</span>
            {isManualEdit && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[9px] uppercase tracking-wide">
                Customized
              </span>
            )}
          </div>

          {/* High Fidelity A4 visual sheet */}
          <div className="w-full max-w-2xl bg-white shadow-xl relative rounded-lg border border-neutral-200 overflow-hidden aspect-[210/297] flex flex-col justify-between print:shadow-none print:border-none print:p-0">
            {/* Header: exactly 53mm tall */}
            <div className="relative w-full h-[53mm] flex flex-col justify-center items-center px-8 pt-6 pb-2 box-border select-none bg-white">
              {/* Top colored bar dynamically themed */}
              <div
                className="absolute top-0 left-0 right-0 h-[4.5mm]"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Company Name: bold, center, capitalized, enlarged */}
              <h2 className="font-serif font-bold text-slate-800 tracking-wider text-xl sm:text-2xl text-center uppercase leading-tight mb-2">
                {coverFields.companyName.toUpperCase()}
              </h2>

              {/* Address followed by a period */}
              <p className="font-serif text-slate-600 text-xs sm:text-sm text-center font-medium leading-relaxed max-w-md mb-0.5">
                {coverFields.referenceAddress}.
              </p>

              {/* Mobile */}
              <p className="font-serif text-slate-600 text-xs sm:text-sm text-center font-medium leading-normal">
                Mobile: {companyData.phone || '01712345678'}
              </p>

              {/* Email */}
              <p className="font-serif text-slate-600 text-xs sm:text-sm text-center font-medium leading-normal">
                Email:{' '}
                {companyData.email ||
                  `info@${(coverFields.companyName || 'company')
                    .toLowerCase()
                    .replace(/\s+/g, '')}.com`}
              </p>

              {/* Horizontal Line at 53mm */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            {/* Letter Body Typing Container */}
            <div className="flex-grow px-10 py-6 box-border bg-white select-text overflow-hidden">
              {coverMode === 'edit' ? (
                <textarea
                  value={letterBody}
                  onChange={(e) => handleLetterBodyChange(e.target.value)}
                  className="w-full h-full border-0 focus:ring-0 p-0 m-0 resize-none font-serif text-slate-900 text-sm leading-relaxed bg-transparent focus:outline-none placeholder-slate-400"
                  placeholder="Type or modify your visa cover letter content here..."
                />
              ) : (
                <div className="w-full h-full font-serif text-slate-900 text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto pr-2 break-words">
                  {letterBody.split('\n').map((para, idx) => {
                    const trimmed = para.trim();
                    const isBold =
                      trimmed.startsWith('Subject:') ||
                      trimmed.startsWith('To,') ||
                      trimmed.startsWith('Dear') ||
                      trimmed.startsWith('Sincerely,') ||
                      trimmed.toLowerCase() === 'sincerely';

                    return (
                      <p
                        key={idx}
                        className={`mb-1 min-h-[1.5rem] ${isBold ? 'font-bold' : 'font-normal'}`}
                      >
                        {para}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Decorative Footer Zone */}
            <div className="relative w-full h-[6mm] bg-white select-none">
              <div className="absolute bottom-0 left-0 right-0 h-[4.5mm] bg-[#FF8006]" />
            </div>
          </div>
        </div>
      </div>

      {/* HIDDEN PRINT TEMPLATE */}
      <div className="hidden print:block w-full h-full bg-white font-serif p-0 m-0">
        <div className="relative w-full aspect-[210/297] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[4.5mm] bg-[#0C8493]" />

          <div className="relative w-full h-[53mm] flex flex-col justify-center items-center px-10 pt-8 pb-2 box-border">
            <h2 className="font-bold text-slate-800 text-2xl text-center uppercase leading-tight mb-2">
              {coverFields.companyName.toUpperCase()}
            </h2>
            <p className="text-slate-600 text-sm text-center font-medium leading-relaxed max-w-lg mb-0.5">
              {coverFields.referenceAddress}.
            </p>
            <p className="text-slate-600 text-sm text-center font-medium leading-normal">
              Mobile: {companyData.phone || '01712345678'}
            </p>
            <p className="text-slate-600 text-sm text-center font-medium leading-normal">
              Email:{' '}
              {companyData.email ||
                `info@${(coverFields.companyName || 'company')
                  .toLowerCase()
                  .replace(/\s+/g, '')}.com`}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#0C8493]" />
          </div>

          <div className="flex-grow px-12 py-8 box-border bg-white text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
            {letterBody.split('\n').map((para, idx) => {
              const trimmed = para.trim();
              const isBold =
                trimmed.startsWith('Subject:') ||
                trimmed.startsWith('To,') ||
                trimmed.startsWith('Dear') ||
                trimmed.startsWith('Sincerely,') ||
                trimmed.toLowerCase() === 'sincerely';

              return (
                <p
                  key={idx}
                  className={`mb-1 min-h-[1.5rem] ${isBold ? 'font-bold' : 'font-normal'}`}
                >
                  {para}
                </p>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[4.5mm] bg-[#FF8006]" />
        </div>
      </div>
    </motion.div>
  );
};
