import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { CompanyData, Theme } from '../types';
import { Sparkles, ArrowLeft, Download } from 'lucide-react';

interface JobIDCardProps {
  companyData: CompanyData;
  onDataChange: (data: CompanyData) => void;
  uploadedLogo: string;
  theme: Theme;
}

export const JobIDCard: React.FC<JobIDCardProps> = ({
  companyData,
  onDataChange,
  uploadedLogo,
  theme,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [previewScale, setPreviewScale] = useState(0.5);

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

      pdf.save(`${companyData.companyName || 'Company'}_Job_ID_Card_A4.pdf`);
    } catch (err) {
      console.error('Error generating A4 PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const primaryColor = theme.primary || '#064E3B';
  const accentColor = theme.accent || '#D4AF37';
  const secondaryColor = theme.secondary || '#0F766E';

  return (
    <div className="w-full flex flex-col gap-6 py-4 px-2 sm:px-6 max-w-7xl mx-auto min-h-screen">
      {step === 'form' ? (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                Job ID Card Generator
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                className="bg-indigo-600 hover:bg-indigo-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Layout: {orientation === 'horizontal' ? 'Landscape' : 'Portrait'}
              </button>

              <button
                onClick={() => photoInputRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Upload Photo
              </button>

              {companyData.empPhoto && (
                <button
                  onClick={() => handleFieldChange('empPhoto', '')}
                  className="bg-rose-600 hover:bg-rose-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
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
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setStep('form')}
              className="bg-white hover:bg-neutral-50 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-neutral-700 font-bold px-4 py-2 rounded-xl text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2 border border-neutral-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Re-design
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadA4PDF}
                disabled={isExporting}
                className="bg-teal-600 hover:bg-teal-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-4 py-2.5 rounded-xl text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating...' : 'Card PDF (A4)'}
              </button>
              <button
                onClick={() => handleDownloadPNG('both')}
                disabled={isExporting}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 border-b-4 border-black/20 active:border-b-0 active:translate-y-[4px] shadow-sm text-white font-bold px-4 py-2.5 rounded-xl text-sm active:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Card PNG
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
                  A4 Print Preview
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
                            {companyData.companyName || 'PROCESSING HUB'}
                          </h3>
                          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                            {companyData.tagline || 'JOB IDENTITY CARD'}
                          </p>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm shrink-0" style={{ backgroundColor: secondaryColor }}>
                        ID: {companyData.empIdNumber || 'PH-88026'}
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-3 items-center my-auto py-1">
                      <div className="col-span-4 flex flex-col items-center justify-center">
                        <div className="w-[110px] h-[135px] bg-neutral-100 border-2 overflow-hidden shadow-sm flex items-center justify-center relative shrink-0" style={{ borderRadius: '6px', borderColor: primaryColor }}>
                          {companyData.empPhoto ? (
                            <img src={companyData.empPhoto} alt={companyData.empName} className="w-full h-full object-cover" style={{ borderRadius: '6px' }} />
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
                            {companyData.empName || 'MOHAMMAD NUR HASNAT'}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white inline-block mt-1" style={{ backgroundColor: primaryColor }}>
                            {companyData.empRole || 'Proprietor'}
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px] font-medium text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-bold uppercase text-[9px]">Mobile:</span>
                            <span className="font-bold text-neutral-900">{companyData.empPhone || companyData.phone || '+8801861186863'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-bold uppercase text-[9px]">Email:</span>
                            <span className="font-bold text-neutral-800 text-[10px] truncate max-w-[180px]">{companyData.empEmail || companyData.email || 'mohammadnurhasnat@gmail.com'}</span>
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
                      <h3 className="text-xs font-black uppercase text-neutral-900">{companyData.companyName || 'PROCESSING HUB'}</h3>
                      <p className="text-[8px] font-bold uppercase text-neutral-500">JOB IDENTITY CARD</p>
                    </div>
                    <div className="relative my-2">
                      <div className="w-28 h-36 bg-neutral-100 border-2 overflow-hidden shadow-sm flex items-center justify-center relative" style={{ borderRadius: '6px', borderColor: primaryColor }}>
                        {companyData.empPhoto ? (
                          <img src={companyData.empPhoto} alt={companyData.empName} className="w-full h-full object-cover" style={{ borderRadius: '6px' }} />
                        ) : (
                          <div className="text-neutral-400 text-center text-xs">👤 Photo</div>
                        )}
                      </div>
                    </div>
                    <div className="w-full space-y-1">
                      <h4 className="text-sm font-black text-neutral-900 uppercase">{companyData.empName || 'MOHAMMAD NUR HASNAT'}</h4>
                      <p className="text-xs font-bold text-emerald-800 uppercase">{companyData.empRole || 'Proprietor'}</p>
                      <p className="text-[10px] text-neutral-600">ID: {companyData.empIdNumber || 'PH-88026'}</p>
                    </div>
                    <div className="w-full text-[10px] space-y-0.5 border-t border-neutral-200 pt-2">
                      <p className="text-neutral-800 font-bold">{companyData.empPhone || companyData.phone || '+8801861186863'}</p>
                      <p className="text-neutral-700 truncate">{companyData.empEmail || companyData.email || 'mohammadnurhasnat@gmail.com'}</p>
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
                      This card is the official property of <strong className="text-neutral-900">{companyData.companyName || 'Processing Hub'}</strong>. It must be displayed at all times while on company premises and returned upon request or resignation.
                    </p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-2.5 mx-2 my-1 space-y-1 text-[10px] text-neutral-800 shadow-sm">
                    <p className="font-black uppercase text-neutral-900">{companyData.companyName || 'PROCESSING HUB'}</p>
                    <p className="text-[9px] text-neutral-600 font-medium leading-tight">{companyData.address || '34/D, Level-3, Jamuna Future Park, Vatara, Dhaka-1229'}</p>
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
