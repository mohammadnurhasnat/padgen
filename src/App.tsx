import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import {
  FileText,
  Eye,
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Calendar,
  User,
  Briefcase,
  MapPin,
  CreditCard,
  Heart,
  Sparkles,
  Palette,
  CreditCard as CardIcon,
  Layers,
  History,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Original App Types & Data
import { CompanyData, DesignControls, HistoryItem, Theme } from './types';
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

// Original Component Imports
import { ControlPanel } from './components/ControlPanel';
import { PreviewStage } from './components/PreviewStage';
import { HistoryPanel } from './components/HistoryPanel';
import { OfficeIDCard } from './components/OfficeIDCard';
import { svgWrap, downloadBlob } from './utils';

// ==========================================
// Cover Letter Sub-module Interfaces & Data
// ==========================================
interface CoverLetterFields {
  applicantName: string;
  passportNumber: string;
  dob: string;
  companyName: string;
  designation: string;
  joiningDate: string;
  patientInfo: string;
  travelFromDate: string;
  travelToDate: string;
  referenceAddress: string;
  letterDate: string;
}

const DEFAULT_COVER_LETTER_FIELDS: CoverLetterFields = {
  applicantName: 'Ameer Ali',
  passportNumber: 'EG0876543',
  dob: '1992-05-15',
  companyName: 'Apex Solutions Ltd.',
  designation: 'Senior Software Engineer',
  joiningDate: '2021-10-01',
  patientInfo: 'My father, Mr. Yusuf Ali (Passport: EG0981234)',
  travelFromDate: '2026-08-10',
  travelToDate: '2026-08-25',
  referenceAddress: 'Grand Palace Hotel, 12 Park Street, Kolkata, WB, 700016',
  letterDate: '2026-07-21',
};

const VISA_CATEGORIES = [
  'Tourist Visa',
  'Business Visa',
  'Medical Visa (Patient)',
  'Medical Attendant Visa',
  'Double Entry Visa'
] as const;

type VisaCategory = typeof VISA_CATEGORIES[number];

function formatDateString(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function generateTemplateText(category: VisaCategory, fields: CoverLetterFields): string {
  const {
    applicantName,
    passportNumber,
    dob,
    companyName,
    designation,
    joiningDate,
    patientInfo,
    travelFromDate,
    travelToDate,
    referenceAddress,
    letterDate,
  } = fields;

  const fDob = formatDateString(dob) || '[Date of Birth]';
  const fJoiningDate = formatDateString(joiningDate) || '[Joining Date]';
  const fTravelFrom = formatDateString(travelFromDate) || '[Travel From Date]';
  const fTravelTo = formatDateString(travelToDate) || '[Travel To Date]';
  const fLetterDate = formatDateString(letterDate) || '[Letter Date]';

  const dateSection = `Date: ${fLetterDate}`;
  const addressSection = `To,\nThe Visa Officer,\nHigh Commission of India,\nDhaka, Bangladesh.`;

  switch (category) {
    case 'Tourist Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Tourist Visa (T) to visit India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), am writing to request a multiple-entry Tourist Visa for my upcoming visit to India.

I am currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'}, having joined the company on ${fJoiningDate}. I have been granted an official leave from my company for my travel from ${fTravelFrom} to ${fTravelTo}.

During my stay in India, I will be sightseeing and experiencing the local culture. I have planned my accommodation at ${referenceAddress || '[Indian Reference / Hotel Address]'}, which will serve as my main base of contact.

I assure you that I am fully capable of financing my entire travel and stay in India. I have attached all the necessary documents, including my passport, bank statement, employment certificate, and itinerary, for your kind consideration.

I kindly request you to grant me the visa to facilitate my travel. I assure you that I will adhere to all the laws and regulations of India and return to my home country before my visa expires.

Thank you for your time and assistance.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Business Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Business Visa (B) to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), representing ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}), am writing this letter to request a Business Visa for my upcoming travel to India.

The purpose of my visit is to attend key business discussions, explore corporate opportunities, and meet with our local business partners in India from ${fTravelFrom} to ${fTravelTo}.

My primary business host and reference address in India will be:
${referenceAddress || '[Indian Reference / Hotel Address]'}

All expenses pertaining to my business trip, including travel, boarding, lodging, and medical insurance, will be fully borne by ${companyName || '[Company Name]'}. I have enclosed my invitation letter, trade certificate, tax documents, and financial statements for your review.

I would highly appreciate it if you could grant me a multiple-entry Business Visa. I guarantee that I will abide by all visa rules and complete my return travel on schedule.

Thank you for your kind consideration of my application.

Sincerely,


${applicantName || '[Applicant Name]'}
${designation || '[Designation]'}
${companyName || '[Company Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Medical Visa (Patient)':
      return `${dateSection}

${addressSection}

Subject: Request for Medical Visa (MED) to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), am writing this letter to request a Medical Visa to travel to India for critical specialized medical treatment.

I am currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}). I have been suffering from health complications that require immediate advanced diagnosis and medical procedures.

Upon consultation, I have been referred to seek advanced treatment in India. I have scheduled appointments and plan to undergo treatment from ${fTravelFrom} to ${fTravelTo} at the following medical facility:
${referenceAddress || '[Indian Reference / Hotel Address]'}

I will be funding all medical expenses, travel, and accommodation myself. All supporting documents, including the doctor's referral letter, hospital appointment confirmation, and my financial statement, are enclosed herewith.

I respectfully request you to grant me a Medical Visa at your earliest convenience so that I can begin my treatment on time.

Thank you for your understanding and prompt support.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Medical Attendant Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Medical Attendant Visa (MED-X) to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), am writing this letter to request a Medical Attendant Visa to travel to India to accompany and assist a medical patient.

I am currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}). I will be traveling to assist the patient, ${patientInfo || '[Patient Info]'}, who is undergoing critical medical treatment in India.

The treatment is scheduled from ${fTravelFrom} to ${fTravelTo} at the following medical institution:
${referenceAddress || '[Indian Reference / Hotel Address]'}

As an attendant, I will be responsible for providing physical support, coordinating with the hospital staff, and managing accommodation during our stay. My presence is vital to facilitate the patient's recovery and care.

I have attached all required medical references, hospital appointment confirmations, proof of relationships, and bank solvency papers. I request your kind consideration in granting me the Medical Attendant Visa.

Thank you for your prompt consideration and support.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;

    case 'Double Entry Visa':
      return `${dateSection}

${addressSection}

Subject: Request for Double Entry Visa to India.

Dear Sir/Madam,

I, ${applicantName || '[Applicant Name]'} (Passport No: ${passportNumber || '[Passport Number]'}, Date of Birth: ${fDob}), currently employed at ${companyName || '[Company Name]'} as ${designation || '[Designation]'} (Joining Date: ${fJoiningDate}), am writing this letter to request a Double Entry Visa to India.

My travel plan consists of two distinct entries. The first entry is from ${fTravelFrom} to ${fTravelTo}, during which I will visit India for sightseeing and personal reasons. Following this, I have an essential requirement to re-enter India shortly after a brief side excursion to a neighboring country.

My reference contact and address in India is:
${referenceAddress || '[Indian Reference / Hotel Address]'}

I am fully capable of financing my entire travel and stay in India. All necessary papers, including my round-trip flight bookings, hotel reservations, and bank statements, are enclosed for your review.

Therefore, I kindly request you to grant me a Double Entry Visa. I assure you that I will respect all the laws and regulations of India.

Thank you for your time and assistance.

Sincerely,


${applicantName || '[Applicant Name]'}
Passport No: ${passportNumber || '[Passport Number]'}`;
  }
}

// ==========================================
// Main Integrated App Component
// ==========================================
export default function App() {
  // Navigation / Workspace tab state
  // 'designer' = Pad & Card Designer, 'cover-letter' = Cover Letter Generator, 'id-card' = Office ID Card
  const [activeTab, setActiveTab] = useState<'designer' | 'cover-letter' | 'id-card'>('designer');
  const [designerStep, setDesignerStep] = useState<'form' | 'preview'>('form');

  // ------------------------------------------
  // 1. Pad & Card Designer State
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
    // Randomize theme index
    const randomTheme = Math.floor(Math.random() * THEMES.length);
    setThemeIdx(randomTheme);

    // Font selection
    if (controls.font === 'random') {
      setResolvedFontIdx(Math.floor(Math.random() * HEADLINE_FONTS.length));
    }
    // Logo Shape selection
    if (controls.shape === 'random') {
      setResolvedShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }
    // Pad Layout selection
    if (controls.padLayout === 'random') {
      setResolvedPadLayout(PAD_LAYOUT_LAYOUTS());
    }
    // Card Layout selection
    if (controls.cardLayout === 'random') {
      setResolvedCardLayout(CARD_LAYOUTS[Math.floor(Math.random() * CARD_LAYOUTS.length)]);
    }
    // Logo style selection
    if (controls.logoStyle === 'random') {
      setResolvedLogoStyle(LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)]);
    }
    // Grid/line style selection
    if (controls.gridStyle === 'random') {
      setResolvedGridStyle(GRID_STYLES[Math.floor(Math.random() * GRID_STYLES.length)]);
    }
    // Texture selection
    if (controls.texture === 'random') {
      setResolvedTexture(TEXTURES[Math.floor(Math.random() * TEXTURES.length)]);
    }

    setDesignerStep('preview');
    setStatus('Generated a beautiful new layout!');
    setTimeout(() => setStatus(null), 3000);
  };

  const PAD_LAYOUT_LAYOUTS = () => {
    return PAD_LAYOUTS[Math.floor(Math.random() * PAD_LAYOUTS.length)];
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

  // Helper to append action to history lists
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

  // Capture utility via html-to-image
  const captureRenderElement = async (ref: React.RefObject<HTMLDivElement | null>, scale: number = 3) => {
    if (!ref.current) {
      throw new Error('Reference is not ready for image capture.');
    }
    return await htmlToImage.toPng(ref.current, {
      pixelRatio: scale,
    });
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
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
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
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [89, 51],
      });
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

  // History Panel Handlers
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
      if (item.type === 'pad-pdf') {
        handleDownloadPadPDF();
      } else if (item.type === 'card-pdf') {
        handleDownloadCardPDF();
      } else if (item.type === 'pad-png') {
        handleDownloadPadPNG();
      } else if (item.type === 'card-png') {
        handleDownloadCardPNG();
      }
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


  // ------------------------------------------
  // 2. Cover Letter Generator State
  // ------------------------------------------
  const [coverFields, setCoverFields] = useState<CoverLetterFields>(DEFAULT_COVER_LETTER_FIELDS);
  const [selectedCategory, setSelectedCategory] = useState<VisaCategory>('Tourist Visa');
  const [letterBody, setLetterBody] = useState<string>('');
  const [isManualEdit, setIsManualEdit] = useState<boolean>(false);
  const [coverMode, setCoverMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState<boolean>(false);

  // Synchronize companyData (Pad & Card section) to coverFields (Cover Letter section)
  useEffect(() => {
    setCoverFields(prev => ({
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
    setCoverFields(prev => ({ ...prev, [key]: value }));
    if (key === 'companyName') setCompanyData(prev => ({ ...prev, companyName: value }));
    if (key === 'applicantName') setCompanyData(prev => ({ ...prev, empName: value }));
    if (key === 'designation') setCompanyData(prev => ({ ...prev, empRole: value }));
    if (key === 'referenceAddress') setCompanyData(prev => ({ ...prev, address: value }));
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

  // High quality Cover Letter jsPDF generation conforming to standard measurements
  const handleDownloadCoverLetterPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginX = 20;
    const contentWidth = pageWidth - (marginX * 2);
    
    // Exact Header Constraint parameters
    const headerHeight = 53;
    const lineY = 53;
    const startY = 65; 
    const endY = 280; 

    // Draw A4 branding borders
    const drawDecorations = (pdfDoc: jsPDF) => {
      // Top Bar #0C8493
      pdfDoc.setFillColor(12, 132, 147);
      pdfDoc.rect(0, 0, pageWidth, 4.5, 'F');

      // Bottom Bar #FF8006
      pdfDoc.setFillColor(255, 128, 6);
      pdfDoc.rect(0, pageHeight - 4.5, pageWidth, 4.5, 'F');
    };

    // Draw standard header details inside the top 53mm zone
    const drawHeaderContent = (pdfDoc: jsPDF) => {
      pdfDoc.setFont('times', 'bold');
      pdfDoc.setFontSize(26);
      pdfDoc.setTextColor(30, 41, 59);
      
      const compName = coverFields.companyName.toUpperCase();
      pdfDoc.text(compName, pageWidth / 2, 18, { align: 'center' });

      pdfDoc.setFont('times', 'normal');
      pdfDoc.setFontSize(12.5);
      pdfDoc.setTextColor(71, 85, 105);

      const addrText = `${coverFields.referenceAddress}.`;
      pdfDoc.text(addrText, pageWidth / 2, 26, { align: 'center', maxWidth: 170 });

      const phoneStr = companyData.phone || '01712345678';
      pdfDoc.text(`Mobile: ${phoneStr}`, pageWidth / 2, 33, { align: 'center' });

      const emailText = `Email: ${companyData.email || `info@${coverFields.companyName.toLowerCase().replace(/\s+/g, '')}.com`}`;
      pdfDoc.text(emailText, pageWidth / 2, 40, { align: 'center' });

      // Horizontal separator line under address block at exactly 53mm
      pdfDoc.setDrawColor(12, 132, 147);
      pdfDoc.setLineWidth(0.5);
      pdfDoc.line(0, lineY, pageWidth, lineY);
    };

    drawDecorations(doc);
    drawHeaderContent(doc);

    doc.setFont('times', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    const leading = 6.2;

    const paragraphs = letterBody.split('\n');
    let currentY = startY;

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (paragraph.trim() === '') {
        currentY += leading * 0.8;
        continue;
      }

      const trimmed = paragraph.trim();
      const isBold =
        trimmed.startsWith('Subject:') ||
        trimmed.startsWith('To,') ||
        trimmed.startsWith('Dear') ||
        trimmed.startsWith('Sincerely,') ||
        trimmed.toLowerCase() === 'sincerely';

      if (isBold) {
        doc.setFont('times', 'bold');
      } else {
        doc.setFont('times', 'normal');
      }

      const wrappedLines: string[] = doc.splitTextToSize(paragraph, contentWidth);

      for (let j = 0; j < wrappedLines.length; j++) {
        const line = wrappedLines[j];

        if (currentY + leading > endY) {
          doc.addPage();
          drawDecorations(doc);
          currentY = 25; // standard margin for overflows
        }

        doc.text(line, marginX, currentY);
        currentY += leading;
      }
    }

    doc.save(`Cover_Letter_${coverFields.applicantName.replace(/\s+/g, '_') || 'Applicant'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-800 transition-colors duration-200">
      
      {/* ------------------------------------------
          WORKSPACE TOP HEADER BAR
         ------------------------------------------ */}
      <header className="sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-md shadow-sm print:hidden bg-white/95 border-neutral-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--coral-light)] text-[var(--coral-accent)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 m-0 leading-none">
                {activeTab === 'designer'
                  ? 'PadGen Studio'
                  : activeTab === 'cover-letter'
                  ? 'Cover Letter Generator'
                  : 'Office ID Card Generator'}
              </h1>
            </div>
          </div>

          {/* TAB CONTROL TOGGLES */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Inline Tab Pill Container */}
            <div className="inline-flex items-center p-1 rounded-full bg-neutral-100 border border-neutral-200 gap-1.5">
              <button
                onClick={() => setActiveTab('designer')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                  activeTab === 'designer'
                    ? 'bg-emerald-600 text-white border-b-2 border-emerald-900 shadow-md font-bold'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                }`}
              >
                Pad & Card Designer
              </button>
              <button
                onClick={() => setActiveTab('cover-letter')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                  activeTab === 'cover-letter'
                    ? 'bg-indigo-600 text-white border-b-2 border-indigo-900 shadow-md font-bold'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                }`}
              >
                Cover Letter Generator
              </button>
              <button
                onClick={() => setActiveTab('id-card')}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                  activeTab === 'id-card'
                    ? 'bg-teal-600 text-white border-b-2 border-teal-900 shadow-md font-bold'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                }`}
              >
                Office ID Card
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ------------------------------------------
          ACTIVE TAB VIEWS
         ------------------------------------------ */}
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
              {/* Left Control Panel Column (Shown in 'form' step) */}
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

              {/* Preview Stage Column */}
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

              {/* Saved templates/download history slider panel */}
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
                    onClick={handleDownloadCoverLetterPDF}
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
                          <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">Applicant & Travel Details</h3>
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
                          <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">Employment Information</h3>
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
                          <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-3">Travel & References</h3>
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
                <div className={`${coverMode === 'edit' ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col items-center`}>
                  
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
                    
                    {/* Header: exactly 53mm tall (2.5 out of 14 parts of 297mm) */}
                    <div className="relative w-full h-[53mm] flex flex-col justify-center items-center px-8 pt-6 pb-2 box-border select-none bg-white">
                      {/* Top colored bar dynamically themed */}
                      <div className="absolute top-0 left-0 right-0 h-[4.5mm]" style={{ backgroundColor: THEMES[themeIdx]?.primary || '#059669' }} />

                      {/* Company Name: bold, center, capitalized, enlarged */}
                      <h2 className="font-serif font-bold text-slate-800 tracking-wider text-xl sm:text-2xl text-center uppercase leading-tight mb-2">
                        {coverFields.companyName.toUpperCase()}
                      </h2>

                      {/* Address followed by a period */}
                      <p className="font-serif text-slate-600 text-xs sm:text-sm text-center font-medium leading-relaxed max-w-md mb-0.5">
                        {coverFields.referenceAddress}.
                      </p>
                      
                      {/* Mobile preceded by Mobile */}
                      <p className="font-serif text-slate-600 text-xs sm:text-sm text-center font-medium leading-normal">
                        Mobile: {companyData.phone || '01712345678'}
                      </p>

                      {/* Email preceded by Email */}
                      <p className="font-serif text-slate-600 text-xs sm:text-sm text-center font-medium leading-normal">
                        Email: {companyData.email || `info@${(coverFields.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com`}
                      </p>

                      {/* Left-to-Right Horizontal Line at exactly 53mm (the 2.5/14 parts mark) themed */}
                      <div className="absolute bottom-0 left-0 right-0 h-[1.5px]" style={{ backgroundColor: THEMES[themeIdx]?.primary || '#059669' }} />
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
                      {/* Bottom colored bar #FF8006 */}
                      <div className="absolute bottom-0 left-0 right-0 h-[4.5mm] bg-[#FF8006]" />
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
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

      {/* ------------------------------------------
          HIDDEN BROWSER PRINT TEMPLATE container
         ------------------------------------------ */}
      <div className="hidden print:block w-full h-full bg-white font-serif p-0 m-0">
        <div className="relative w-full aspect-[210/297] flex flex-col justify-between">
          {/* Top colored bar #0C8493 */}
          <div className="absolute top-0 left-0 right-0 h-[4.5mm] bg-[#0C8493]" />

          {/* Header Area */}
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
              Email: {companyData.email || `info@${(coverFields.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com`}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#0C8493]" />
          </div>

          {/* Letter Body */}
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

          {/* Bottom colored bar #FF8006 */}
          <div className="absolute bottom-0 left-0 right-0 h-[4.5mm] bg-[#FF8006]" />
        </div>
      </div>

    </div>
  );
}
