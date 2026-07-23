import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { CompanyData, Theme } from '../types';

interface OfficeIDCardProps {
  companyData: CompanyData;
  onDataChange: (data: CompanyData) => void;
  uploadedLogo: string;
  theme: Theme;
}

export const OfficeIDCard: React.FC<OfficeIDCardProps> = ({
  companyData,
  onDataChange,
  uploadedLogo,
  theme,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const printSheetRef = useRef<HTMLDivElement>(null);

  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
        }
      };
      reader.readAsDataURL(file);
    }
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

  // Download A4 Page PDF containing both Front & Back Cards scaled to exact CR80 85.6mm x 54mm
  const handleDownloadA4PDF = async () => {
    setIsExporting(true);
    try {
      if (!frontCardRef.current || !backCardRef.current) return;

      const frontDataUrl = await htmlToImage.toPng(frontCardRef.current, { pixelRatio: 3 });
      const backDataUrl = await htmlToImage.toPng(backCardRef.current, { pixelRatio: 3 });

      // Create A4 PDF (210mm x 297mm Portrait)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Card Dimensions in mm (CR80 Standard)
      const cardW = orientation === 'horizontal' ? 85.6 : 54;
      const cardH = orientation === 'horizontal' ? 54 : 85.6;

      // Header title on A4 page
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`${companyData.companyName || 'Corporate'} Office ID Card`, 105, 20, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('A4 Print Sheet — Standard CR80 Dimensions (85.6 mm × 54 mm)', 105, 26, { align: 'center' });

      // Calculate positions for centered stacking
      const spaceBetween = 15;
      const totalHeight = (cardH * 2) + spaceBetween;
      const startY = (297 - totalHeight) / 2;
      const startX = (210 - cardW) / 2;

      // Draw light cut outline boxes
      pdf.setDrawColor(200, 200, 200);

      // Front Card
      pdf.addImage(frontDataUrl, 'PNG', startX, startY, cardW, cardH);
      pdf.rect(startX, startY, cardW, cardH);

      // Back Card
      const backY = startY + cardH + spaceBetween;
      pdf.addImage(backDataUrl, 'PNG', startX, backY, cardW, cardH);
      pdf.rect(startX, backY, cardW, cardH);

      pdf.save(`${companyData.companyName || 'Company'}_Office_ID_Card_A4.pdf`);
    } catch (err) {
      console.error('Error generating A4 PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Primary and accent colors from theme
  const primaryColor = theme.primary || '#064E3B';
  const accentColor = theme.accent || '#D4AF37';
  const secondaryColor = theme.secondary || '#0F766E';

  return (
    <div className="w-full flex flex-col gap-6 py-4 px-2 sm:px-6 max-w-6xl mx-auto">
      {/* Top Action & Field Bar */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col gap-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 leading-tight">
              Office ID Card Generator
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
              className="bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-900 shadow-md text-white font-bold px-3.5 py-2 rounded-xl text-xs active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Layout: {orientation === 'horizontal' ? 'Landscape (Standard)' : 'Portrait (Vertical)'}
            </button>

            <button
              onClick={() => photoInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-900 shadow-md text-white font-bold px-3.5 py-2 rounded-xl text-xs active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Upload Employee Photo
            </button>

            {companyData.empPhoto && (
              <button
                onClick={() => handleFieldChange('empPhoto', '')}
                className="bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-900 shadow-md text-white font-bold px-3 py-2 rounded-xl text-xs active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
              >
                Remove Photo
              </button>
            )}

            <button
              onClick={handleDownloadA4PDF}
              disabled={isExporting}
              className="bg-teal-600 hover:bg-teal-500 border-b-4 border-teal-900 shadow-md text-white font-bold px-4 py-2 rounded-xl text-xs active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              {isExporting ? 'Generating...' : 'Download Office ID'}
            </button>

            <button
              onClick={() => handleDownloadPNG('both')}
              disabled={isExporting}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 border-b-4 border-fuchsia-900 shadow-md text-white font-bold px-4 py-2 rounded-xl text-xs active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              Download PNG
            </button>

            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* Integrated Direct Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Company Name</label>
            <input
              type="text"
              value={companyData.companyName || ''}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              placeholder="Company Name"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Employee Name</label>
            <input
              type="text"
              value={companyData.empName || ''}
              onChange={(e) => handleFieldChange('empName', e.target.value)}
              placeholder="Employee Name"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Designation</label>
            <input
              type="text"
              value={companyData.empRole || ''}
              onChange={(e) => handleFieldChange('empRole', e.target.value)}
              placeholder="Designation"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">ID / Badge Number</label>
            <input
              type="text"
              value={companyData.empIdNumber || 'PH-88026'}
              onChange={(e) => handleFieldChange('empIdNumber', e.target.value)}
              placeholder="ID Number"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Employee Mobile</label>
            <input
              type="text"
              value={companyData.empPhone || companyData.phone || ''}
              onChange={(e) => handleFieldChange('empPhone', e.target.value)}
              placeholder="Mobile Number"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Employee Email</label>
            <input
              type="email"
              value={companyData.empEmail || companyData.email || ''}
              onChange={(e) => handleFieldChange('empEmail', e.target.value)}
              placeholder="Employee Email"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono text-[10px] text-neutral-500 uppercase font-bold">Company Address</label>
            <input
              type="text"
              value={companyData.address || ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              placeholder="Address"
              className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Interactive Canvas Preview */}
      <div className="flex flex-col items-center gap-6 py-6 bg-neutral-100 rounded-3xl border border-neutral-200 shadow-inner print:hidden">
        <div className="flex items-center justify-between w-full max-w-4xl px-6">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
            {orientation === 'horizontal' ? 'Landscape CR80 Layout (3.375" × 2.125" / 85.6 mm × 54 mm)' : 'Portrait CR80 Layout (2.125" × 3.375" / 54 mm × 85.6 mm)'}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Two-Column Clean Design • 6px Photo Radius
          </span>
        </div>

        {/* Cards Container */}
        <div
          className={`flex ${
            orientation === 'horizontal' ? 'flex-col lg:flex-row' : 'flex-col md:flex-row'
          } items-center justify-center gap-8`}
        >
          {/* ==================== FRONT SIDE ==================== */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest font-mono">
              FRONT SIDE
            </span>
            <div
              ref={frontCardRef}
              className={`relative bg-white overflow-hidden shadow-xl border border-neutral-300 transition-all duration-200 ${
                orientation === 'horizontal'
                  ? 'w-[514px] h-[324px] rounded-[16px]'
                  : 'w-[324px] h-[514px] rounded-[16px]'
              }`}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Top Accent Strip */}
              <div
                className="w-full h-3"
                style={{ backgroundColor: primaryColor }}
              />

              {orientation === 'horizontal' ? (
                /* LANDSCAPE TWO-COLUMN LAYOUT */
                <div className="p-4 flex flex-col justify-between h-[calc(100%-12px)]">
                  {/* Top Header: Logo + Company Name */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      {uploadedLogo ? (
                        <img
                          src={uploadedLogo}
                          alt="Logo"
                          className="h-8 max-w-[120px] object-contain"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {(companyData.companyName || 'C').charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-black tracking-tight text-neutral-900 uppercase leading-tight max-w-[260px] truncate">
                          {companyData.companyName || 'PROCESSING HUB'}
                        </h3>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                          {companyData.tagline || 'OFFICE IDENTITY CARD'}
                        </p>
                      </div>
                    </div>

                    <div
                      className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm shrink-0"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      ID: {companyData.empIdNumber || 'PH-88026'}
                    </div>
                  </div>

                  {/* Two Column Section */}
                  <div className="grid grid-cols-12 gap-3 items-center my-auto py-1">
                    {/* Column 1: Employee Photo with STRICT 6px BORDER RADIUS */}
                    <div className="col-span-4 flex flex-col items-center justify-center">
                      <div
                        className="w-[110px] h-[135px] bg-neutral-100 border-2 overflow-hidden shadow-md flex items-center justify-center relative shrink-0"
                        style={{
                          borderRadius: '6px', // STRICT 6px RADIUS
                          borderColor: primaryColor,
                        }}
                      >
                        {companyData.empPhoto ? (
                          <img
                            src={companyData.empPhoto}
                            alt={companyData.empName}
                            className="w-full h-full object-cover"
                            style={{ borderRadius: '6px' }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center text-neutral-400">
                            <span className="text-2xl mb-1">👤</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider">
                              Photo
                            </span>
                            <span className="text-[7.5px] text-neutral-400 mt-0.5">(6px frame)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Details & Info */}
                    <div className="col-span-8 flex flex-col justify-center space-y-2">
                      <div>
                        <h4 className="text-base font-black text-neutral-900 uppercase tracking-tight leading-tight">
                          {companyData.empName || 'MOHAMMAD NUR HASNAT'}
                        </h4>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white inline-block mt-1"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {companyData.empRole || 'Proprietor'}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-medium text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400 font-bold uppercase text-[9px]">Mobile:</span>
                          <span className="font-bold text-neutral-900">
                            {companyData.empPhone || companyData.phone || '+8801861186863'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400 font-bold uppercase text-[9px]">Email:</span>
                          <span className="font-bold text-neutral-800 text-[10px] truncate max-w-[180px]">
                            {companyData.empEmail || companyData.email || 'mohammadnurhasnat@gmail.com'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Barcode Strip */}
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                    <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest">
                      AUTHORIZED IDENTITY BADGE
                    </span>

                    {/* Vector Barcode */}
                    <div className="flex items-center gap-[2px] h-5 w-36 bg-white">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4].map((w, i) => (
                        <div key={i} className="h-full bg-neutral-900" style={{ width: `${w}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* PORTRAIT LAYOUT BODY */
                <div className="flex flex-col items-center justify-between p-4 h-[calc(100%-12px)] text-center">
                  <div className="flex flex-col items-center gap-1 w-full border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-black uppercase text-neutral-900">
                      {companyData.companyName || 'PROCESSING HUB'}
                    </h3>
                    <p className="text-[8px] font-bold uppercase text-neutral-500">
                      OFFICE IDENTITY CARD
                    </p>
                  </div>

                  <div className="relative my-2">
                    <div
                      className="w-28 h-36 bg-neutral-100 border-2 overflow-hidden shadow-md flex items-center justify-center relative"
                      style={{
                        borderRadius: '6px',
                        borderColor: primaryColor,
                      }}
                    >
                      {companyData.empPhoto ? (
                        <img
                          src={companyData.empPhoto}
                          alt={companyData.empName}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: '6px' }}
                        />
                      ) : (
                        <div className="text-neutral-400 text-center text-xs">👤 Photo</div>
                      )}
                    </div>
                  </div>

                  <div className="w-full space-y-1">
                    <h4 className="text-sm font-black text-neutral-900 uppercase">
                      {companyData.empName || 'MOHAMMAD NUR HASNAT'}
                    </h4>
                    <p className="text-xs font-bold text-emerald-800 uppercase">
                      {companyData.empRole || 'Proprietor'}
                    </p>
                    <p className="text-[10px] text-neutral-600">
                      ID: {companyData.empIdNumber || 'PH-88026'}
                    </p>
                  </div>

                  <div className="w-full text-[10px] space-y-0.5 border-t border-neutral-200 pt-2">
                    <p className="text-neutral-800 font-bold">
                      {companyData.empPhone || companyData.phone || '+8801861186863'}
                    </p>
                    <p className="text-neutral-700 truncate">
                      {companyData.empEmail || companyData.email || 'mohammadnurhasnat@gmail.com'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== BACK SIDE ==================== */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest font-mono">
              BACK SIDE
            </span>
            <div
              ref={backCardRef}
              className={`relative bg-neutral-50 overflow-hidden shadow-xl border border-neutral-300 transition-all duration-200 flex flex-col justify-between ${
                orientation === 'horizontal'
                  ? 'w-[514px] h-[324px] rounded-[16px]'
                  : 'w-[324px] h-[514px] rounded-[16px]'
              }`}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Top Stripe */}
              <div className="w-full h-3" style={{ backgroundColor: primaryColor }} />

              <div className="p-4 flex flex-col justify-between flex-1 text-center">
                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
                    TERMS & CONDITIONS OF USE
                  </h5>
                  <p className="text-[9px] text-neutral-600 leading-relaxed font-medium px-4">
                    This card is the official property of <strong className="text-neutral-900">{companyData.companyName || 'Processing Hub'}</strong>. It must be displayed at all times while on company premises and returned upon request or resignation.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-2.5 mx-2 my-1 space-y-1 text-[10px] text-neutral-800 shadow-sm">
                  <p className="font-black uppercase text-neutral-900">
                    {companyData.companyName || 'PROCESSING HUB'}
                  </p>
                  <p className="text-[9px] text-neutral-600 font-medium leading-tight">
                    {companyData.address || '34/D, Level-3, Jamuna Future Park, Vatara, Dhaka-1229'}
                  </p>
                  <div className="flex justify-center gap-4 text-[9.5px] font-bold text-neutral-800 pt-0.5">
                    <span>Hotline: {companyData.phone || '+8801332601510'}</span>
                    <span>Email: {companyData.email || 'info@processinghub.com'}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between px-4 pt-1">
                  <div className="text-left">
                    <span className="text-[8px] text-neutral-400 font-bold block">VALID THRU</span>
                    <span className="text-[9.5px] font-bold text-neutral-800">DEC 2028</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-28 border-b border-neutral-900 pb-0.5 text-center font-serif text-[11px] italic font-bold text-neutral-900">
                      M. N. Hasnat
                    </div>
                    <span className="text-[8px] font-black uppercase text-neutral-500 mt-0.5">
                      AUTHORIZED SIGNATURE
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Stripe */}
              <div className="w-full h-3" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== A4 PRINT DISPLAY AREA ==================== */}
      <div className="hidden print:flex font-sans absolute top-0 left-0 w-full bg-white z-50 h-screen flex-col items-center justify-center">
        <div className="w-[210mm] h-[297mm] mx-auto bg-white flex flex-col items-center justify-center text-center">
          <p className="text-sm text-neutral-500 mb-4">
            For exact standard CR80 size (85.6mm × 54mm) printing, please use the <strong>"Download Office ID"</strong> button.
          </p>
          <p className="text-xs text-neutral-400">
            Browser printing may alter dimensions due to margins and scale settings.
          </p>
        </div>
      </div>
    </div>
  );
};
