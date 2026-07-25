import React, { useState, useEffect, useRef } from 'react';
import {
  Stamp,
  Download,
  RotateCw,
  Sparkles,
  CheckCircle2,
  FileCheck,
  Palette,
  Sliders,
  Type,
  Building,
  Briefcase,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CompanyData } from '../types';

interface DigitalSealGeneratorProps {
  companyData: CompanyData;
  onApplyToNOC?: (sealDataUrl: string) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

const ROLE_OPTIONS = [
  'Proprietor',
  'Director',
  'Managing Director',
  'CEO',
  'Manager',
  'Chairman',
  'General Manager',
  'Partner',
];

const COLOR_OPTIONS = [
  { name: 'Official Purple', hex: '#6A1B9A', rgb: '106, 27, 154' },
  { name: 'Navy Blue', hex: '#1A237E', rgb: '26, 35, 126' },
  { name: 'Deep Red', hex: '#C62828', rgb: '198, 40, 40' },
  { name: 'Charcoal Black', hex: '#212121', rgb: '33, 33, 33' },
  { name: 'Forest Green', hex: '#1B5E20', rgb: '27, 94, 32' },
];

export const DigitalSealGenerator: React.FC<DigitalSealGeneratorProps> = ({
  companyData,
  onApplyToNOC,
  onOpenHistory,
  historyCount = 0,
}) => {
  const [companyName, setCompanyName] = useState<string>(companyData.name || 'Ratul Tours');
  const [roleTitle, setRoleTitle] = useState<string>('Proprietor');
  const [customRole, setCustomRole] = useState<string>('');
  const [isCustomRole, setIsCustomRole] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<typeof COLOR_OPTIONS[0]>(COLOR_OPTIONS[0]);
  const [tiltAngle, setTiltAngle] = useState<number>(8); // Default +8 degrees
  const [textureIntensity, setTextureIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [seed, setSeed] = useState<number>(1); // Seed to re-randomize texture
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedToNOC, setAppliedToNOC] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with companyData when changed
  useEffect(() => {
    if (companyData.name && companyName === 'Ratul Tours') {
      setCompanyName(companyData.name);
    }
  }, [companyData]);

  // Actual Role Title string to render
  const activeRole = isCustomRole ? customRole : roleTitle;

  // Generate Seal Canvas
  const generateSealCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions for target output
    const baseW = 500;
    const baseH = 220;
    const scale = 2; // HD 2x scale for ultra-sharp rendering

    // Bounding Box calculation for rotated canvas so no corners clip
    const rad = (Math.abs(tiltAngle) * Math.PI) / 180;
    const boundingW = Math.ceil(baseW * Math.cos(rad) + baseH * Math.sin(rad)) + 20;
    const boundingH = Math.ceil(baseW * Math.sin(rad) + baseH * Math.cos(rad)) + 20;

    canvas.width = boundingW * scale;
    canvas.height = boundingH * scale;

    ctx.save();
    ctx.scale(scale, scale);

    // Clear background to 100% transparent
    ctx.clearRect(0, 0, boundingW, boundingH);

    // Translate to center for rotation
    const centerX = boundingW / 2;
    const centerY = boundingH / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate((tiltAngle * Math.PI) / 180);
    ctx.translate(-baseW / 2, -baseH / 2);

    // Ink stroke & fill setup
    const inkRgb = selectedColor.rgb;
    ctx.strokeStyle = `rgba(${inkRgb}, 0.92)`;
    ctx.fillStyle = `rgba(${inkRgb}, 0.92)`;

    // Enable slight blur filter for realistic pressed ink bleeding
    ctx.filter = 'blur(0.4px)';

    // 1. Outer Rectangle Border (4px stroke, 8px inset)
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, baseW - 16, baseH - 16);

    // 2. Inner Rectangle Border (2px stroke, 16px inset)
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, baseW - 32, baseH - 32);

    // 3. Top Line: Company Name (Uppercase, bold, centered)
    const upperCompany = (companyName || 'COMPANY NAME').trim().toUpperCase();
    let compFontSize = 28;
    ctx.font = `bold ${compFontSize}px "Playfair Display", "Times New Roman", "Georgia", sans-serif`;

    const maxTextWidth = (baseW - 60) * 0.85;
    let compWidth = ctx.measureText(upperCompany).width;

    if (compWidth > maxTextWidth && compWidth > 0) {
      compFontSize = Math.max(14, Math.floor(28 * (maxTextWidth / compWidth)));
      ctx.font = `bold ${compFontSize}px "Playfair Display", "Times New Roman", "Georgia", sans-serif`;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(upperCompany, baseW / 2, 58);

    // 4. Horizontal Divider Line below Company Name
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(30, 84);
    ctx.lineTo(baseW - 30, 84);
    ctx.stroke();

    // 5. Middle Blank Signature Line (Reserved empty)
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(45, 130);
    ctx.lineTo(baseW - 45, 130);
    ctx.stroke();

    // 6. Bottom Line: Role Title (Uppercase, bold, centered, visually matched font size)
    const upperRole = (activeRole || 'PROPRIETOR').trim().toUpperCase();
    let roleFontSize = Math.min(26, compFontSize);
    ctx.font = `bold ${roleFontSize}px "Playfair Display", "Times New Roman", "Georgia", sans-serif`;

    let roleWidth = ctx.measureText(upperRole).width;

    if (roleWidth > maxTextWidth && roleWidth > 0) {
      roleFontSize = Math.max(13, Math.floor(roleFontSize * (maxTextWidth / roleWidth)));
      ctx.font = `bold ${roleFontSize}px "Playfair Display", "Times New Roman", "Georgia", sans-serif`;
    }

    ctx.fillText(upperRole, baseW / 2, 176);

    // Disable blur for composite eraser texture phase
    ctx.filter = 'none';

    // 7. Realistic Ink Stamp Texture (Destination-out eraser blobs)
    ctx.globalCompositeOperation = 'destination-out';

    // Deterministic random generator based on seed
    let pseudoRandom = seed;
    const random = () => {
      pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280;
      return pseudoRandom / 233280;
    };

    const blobCount = textureIntensity === 'low' ? 12 : textureIntensity === 'medium' ? 20 : 32;

    for (let i = 0; i < blobCount; i++) {
      const bx = 10 + random() * (baseW - 20);
      const by = 10 + random() * (baseH - 20);
      const radius = 18 + random() * 28;
      const opacity = 0.25 + random() * 0.45;

      const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
      gradient.addColorStop(0.7, `rgba(0, 0, 0, ${opacity * 0.4})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bx, by, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // Export Data URL
    const url = canvas.toDataURL('image/png');
    setPreviewDataUrl(url);
  };

  // Trigger canvas generation whenever inputs change
  useEffect(() => {
    generateSealCanvas();
  }, [companyName, activeRole, selectedColor, tiltAngle, textureIntensity, seed]);

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.href = previewDataUrl;
    const cleanName = (companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `digital_seal_${cleanName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    if (!previewDataUrl) return;
    try {
      const blob = await (await fetch(previewDataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
    }
  };

  const handleSendToNOC = () => {
    if (!previewDataUrl) return;
    if (onApplyToNOC) {
      onApplyToNOC(previewDataUrl);
      setAppliedToNOC(true);
      setTimeout(() => setAppliedToNOC(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Digital Seal & Rubber Stamp Generator
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
              Generate official company seals with realistic ink texture & angle tilt. Download transparent PNG or attach directly to your NOC documents.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="px-3.5 py-2 bg-purple-800/60 hover:bg-purple-700 text-purple-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-purple-600/40 cursor-pointer"
              title="Regenerate random ink texture"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
              <span>Re-Stamp Texture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls + Right Live Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
              Seal Information & Controls
            </h3>
          </div>

          {/* Company Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-purple-600" />
              Company Name (কোম্পানির নাম):
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Ratul Tours & Travels"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-sm font-semibold text-neutral-800 transition-all"
            />
          </div>

          {/* Role Title Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
              Role Title (পদবী):
            </label>

            {!isCustomRole ? (
              <div className="space-y-2">
                <select
                  value={roleTitle}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomRole(true);
                      setCustomRole('');
                    } else {
                      setRoleTitle(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-sm font-semibold text-neutral-800 transition-all bg-white"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Write Custom Role Title...</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Type custom designation..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 text-sm font-semibold text-neutral-800"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustomRole(false)}
                  className="px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Dropdown
                </button>
              </div>
            )}
          </div>

          {/* Ink Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              Ink Stamp Color (কালির রঙ):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    selectedColor.hex === col.hex
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200 scale-105'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="text-[10px] font-bold text-neutral-700 truncate w-full text-center">
                    {col.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stamp Angle Tilt & Texture Intensity */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            {/* Tilt Angle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700">Tilt Angle:</label>
                <span className="text-xs font-mono font-bold text-purple-700">{tiltAngle}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                value={tiltAngle}
                onChange={(e) => setTiltAngle(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold">
                <span>-15°</span>
                <button
                  type="button"
                  onClick={() => setTiltAngle(8)}
                  className="text-purple-600 hover:underline"
                >
                  Reset (+8°)
                </button>
                <span>+15°</span>
              </div>
            </div>

            {/* Ink Texture */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Ink Texture:</label>
              <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTextureIntensity(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                      textureIntensity === lvl
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Stage & Download Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 p-6 sm:p-10 rounded-2xl border border-neutral-800 shadow-xl flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden group">
            {/* Decorative Checkerboard pattern to highlight transparent PNG */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #171717 1px)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            />

            {/* Hidden Canvas element used for crisp generation */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Rendered Transparent PNG Image Preview */}
            {previewDataUrl ? (
              <motion.div
                key={`${companyName}-${activeRole}-${selectedColor.hex}-${tiltAngle}-${seed}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 p-4 rounded-xl max-w-full flex items-center justify-center"
              >
                <img
                  src={previewDataUrl}
                  alt="Digital Seal Preview"
                  className="max-w-full h-auto max-h-[220px] object-contain drop-shadow-2xl select-none"
                />
              </motion.div>
            ) : (
              <div className="text-neutral-500 text-xs font-bold flex items-center gap-2 z-10">
                <Stamp className="w-5 h-5 animate-pulse text-purple-400" />
                <span>Generating Digital Seal...</span>
              </div>
            )}

            <span className="absolute bottom-3 left-4 text-[10px] text-neutral-500 font-mono">
              Transparent PNG Canvas • 500x220px • {selectedColor.name}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleDownload}
              className="py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 border-purple-900"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG Seal</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="py-3.5 px-4 bg-neutral-800 hover:bg-neutral-900 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 border-neutral-950"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied Image!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-300" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {onApplyToNOC && (
              <button
                onClick={handleSendToNOC}
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 border-emerald-900"
              >
                {appliedToNOC ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Applied to NOC!</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Attach to NOC PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
