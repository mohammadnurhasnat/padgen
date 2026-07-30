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
  const [companyName, setCompanyName] = useState<string>(companyData.companyName || companyData.name || 'Ratul Tours');
  const [roleTitle, setRoleTitle] = useState<string>('Proprietor');
  const [customRole, setCustomRole] = useState<string>('');
  const [isCustomRole, setIsCustomRole] = useState<boolean>(false);
  const [sealShape, setSealShape] = useState<'rectangular' | 'circular' | 'rectangular_combo' | 'circular_combo'>('rectangular');
  const [establishedYear, setEstablishedYear] = useState<string>('2020');
  const [sloganText, setSloganText] = useState<string>(companyData.tagline || 'Excellence & Trust');
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
    if (companyData.companyName || companyData.name) {
      setCompanyName(companyData.companyName || companyData.name || '');
    }
    if (companyData.tagline) {
      setSloganText(companyData.tagline);
    }
  }, [companyData]);

  // Actual Role Title string to render
  const activeRole = isCustomRole ? customRole : roleTitle;

  // Helper for drawing curved text along circular arc
  const drawCurvedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    centerY: number,
    radius: number,
    startAngleRad: number,
    endAngleRad: number
  ) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numChars = text.length;
    if (numChars === 0) {
      ctx.restore();
      return;
    }

    const angleStep = (endAngleRad - startAngleRad) / Math.max(1, numChars - 1);

    for (let i = 0; i < numChars; i++) {
      const char = text[i];
      const angle = startAngleRad + i * angleStep;

      ctx.save();
      ctx.translate(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  // Generate Seal Canvas
  const generateSealCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size depending on shape
    let baseW = 480;
    let baseH = 220;

    if (sealShape === 'circular') {
      baseW = 260;
      baseH = 260;
    } else if (sealShape === 'rectangular_combo' || sealShape === 'circular_combo') {
      baseW = 620;
      baseH = 240;
    }

    const scale = 2; // HD scale

    // Bounding Box calculation for rotated canvas
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

    const upperCompany = (companyName || 'COMPANY NAME').trim().toUpperCase();
    const upperRole = (activeRole || 'PROPRIETOR').trim().toUpperCase();

    // DRAW RECTANGULAR SEAL
    const drawRectangularSection = (startX: number, startY: number, width: number, height: number) => {
      // Clean Outer & Inner borders without corner tick artifacts
      ctx.lineWidth = 4;
      ctx.strokeRect(startX + 8, startY + 8, width - 16, height - 16);

      ctx.lineWidth = 2;
      ctx.strokeRect(startX + 16, startY + 16, width - 32, height - 32);

      // Top Institution / Company Name
      let fontSize = 24;
      ctx.font = `bold ${fontSize}px "Playfair Display", "Times New Roman", "Georgia", serif`;
      const maxTextWidth = width - 60;
      let textWidth = ctx.measureText(upperCompany).width;
      if (textWidth > maxTextWidth && textWidth > 0) {
        fontSize = Math.max(13, Math.floor(24 * (maxTextWidth / textWidth)));
        ctx.font = `bold ${fontSize}px "Playfair Display", "Times New Roman", "Georgia", serif`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(upperCompany, startX + width / 2, startY + 52);

      // Top Divider Line
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.moveTo(startX + 28, startY + 76);
      ctx.lineTo(startX + width - 28, startY + 76);
      ctx.stroke();

      // Middle Blank Space for Signature
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.moveTo(startX + 40, startY + 125);
      ctx.lineTo(startX + width - 40, startY + 125);
      ctx.stroke();

      // Bottom Role: PROPRIETOR
      let roleFontSize = Math.min(22, fontSize);
      ctx.font = `bold ${roleFontSize}px "Playfair Display", "Times New Roman", "Georgia", serif`;
      ctx.fillText(upperRole, startX + width / 2, startY + height - 42);
    };

    // DRAW CIRCULAR SEAL
    const drawCircularSection = (cx: number, cy: number, radius: number) => {
      // Outer Circle
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Circle
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
      ctx.stroke();

      // Curved Top Company Name
      let arcFont = 15;
      ctx.font = `bold ${arcFont}px "Playfair Display", "Times New Roman", sans-serif`;
      const topArcRadius = radius - 26;
      drawCurvedText(ctx, upperCompany, cx, cy, topArcRadius, -Math.PI * 0.75, -Math.PI * 0.25);

      // Decorative stars on sides
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', cx - radius + 22, cy);
      ctx.fillText('★', cx + radius - 22, cy);

      // Middle Signature Line
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.moveTo(cx - 50, cy);
      ctx.lineTo(cx + 50, cy);
      ctx.stroke();

      // Bottom PROPRIETOR
      ctx.font = `bold 14px "Playfair Display", "Times New Roman", serif`;
      ctx.fillText(upperRole, cx, cy + 32);

      // Established Year at bottom arc
      if (establishedYear) {
        ctx.font = `bold 10px sans-serif`;
        ctx.fillText(`ESTD. ${establishedYear}`, cx, cy + 54);
      }
    };

    // DRAW RIGHT SIDE INFO (Company Name + Slogan + Est. Year)
    const drawSideInfoSection = (startX: number, startY: number, width: number, height: number) => {
      // Vertical Divider Line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.moveTo(startX, startY + 20);
      ctx.lineTo(startX, startY + height - 20);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const textX = startX + 25;

      // Company Name
      ctx.font = `bold 20px "Playfair Display", "Georgia", serif`;
      ctx.fillText(upperCompany, textX, startY + height / 2 - 30);

      // Slogan / Tagline
      if (sloganText) {
        ctx.font = `italic 14px "Playfair Display", "Georgia", serif`;
        ctx.fillText(`"${sloganText}"`, textX, startY + height / 2 + 5);
      }

      // Est Year
      if (establishedYear) {
        ctx.font = `bold 12px sans-serif`;
        ctx.fillText(`ESTABLISHED: ${establishedYear}`, textX, startY + height / 2 + 35);
      }
    };

    // EXECUTE LAYOUT RENDER
    if (sealShape === 'rectangular') {
      drawRectangularSection(0, 0, baseW, baseH);
    } else if (sealShape === 'circular') {
      drawCircularSection(baseW / 2, baseH / 2, 110);
    } else if (sealShape === 'rectangular_combo') {
      drawRectangularSection(0, 10, 380, 220);
      drawSideInfoSection(400, 10, 210, 220);
    } else if (sealShape === 'circular_combo') {
      drawCircularSection(130, 120, 105);
      drawSideInfoSection(270, 10, 340, 220);
    }

    // Disable blur for composite eraser texture phase
    ctx.filter = 'none';

    // Ink Stamp Texture
    ctx.globalCompositeOperation = 'destination-out';

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

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // Export Data URL
    const url = canvas.toDataURL('image/png');
    setPreviewDataUrl(url);
  };

  // Trigger canvas generation whenever inputs change
  useEffect(() => {
    generateSealCanvas();
  }, [companyName, activeRole, sealShape, establishedYear, sloganText, selectedColor, tiltAngle, textureIntensity, seed]);

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
              Seal Generator
            </h2>
           
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls + Right Live Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
          {/* Seal Pattern / Shape Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Stamp className="w-3.5 h-3.5 text-purple-600" />
              Seal Pattern & Layout (সিল এর ধরণ):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSealShape('rectangular')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  sealShape === 'rectangular'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                Rectangular Seal
              </button>
              <button
                type="button"
                onClick={() => setSealShape('circular')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  sealShape === 'circular'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                Circular Seal
              </button>
              <button
                type="button"
                onClick={() => setSealShape('rectangular_combo')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  sealShape === 'rectangular_combo'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                Rect. + Side Info
              </button>
              <button
                type="button"
                onClick={() => setSealShape('circular_combo')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  sealShape === 'circular_combo'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                Circ. + Side Info
              </button>
            </div>
          </div>

          {/* Company Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-purple-600" />
              Company / Institution Name:
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Ratul Tours & Travels"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-sm font-semibold text-neutral-800 transition-all"
            />
          </div>

          {/* Side Info Details (Tagline & Established Year) */}
          {(sealShape === 'rectangular_combo' || sealShape === 'circular_combo' || sealShape === 'circular') && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Tagline / Slogan:</label>
                <input
                  type="text"
                  value={sloganText}
                  onChange={(e) => setSloganText(e.target.value)}
                  placeholder="e.g. Excellence & Trust"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Est. Year:</label>
                <input
                  type="text"
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white"
                />
              </div>
            </div>
          )}

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
