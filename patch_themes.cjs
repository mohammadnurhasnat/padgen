const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const newThemes = `export const THEMES: Theme[] = [
  { name: 'Corporate Navy & Silver', primary: '#1A2942', accent: '#8E9AA7', paper: '#FFFFFF' },
  { name: 'Executive Charcoal & Gold', primary: '#2C3033', accent: '#C8A97E', paper: '#FFFFFF' },
  { name: 'Classic Slate & Blue', primary: '#2A3644', accent: '#3873B6', paper: '#FFFFFF' },
  { name: 'Minimalist Black & Gray', primary: '#1C1E22', accent: '#737373', paper: '#FFFFFF' },
  { name: 'Royal Onyx & Copper', primary: '#1B1B1B', accent: '#B87333', paper: '#FFFFFF' },
  { name: 'Trust Blue & Steel', primary: '#0A3161', accent: '#909497', paper: '#FFFFFF' },
  { name: 'Forest Green & Beige', primary: '#1C3B2B', accent: '#D2B48C', paper: '#FFFFFF' },
  { name: 'Deep Burgundy & Ivory', primary: '#4A1C20', accent: '#E8DCC4', paper: '#FFFFFF' },
  { name: 'Tech Cobalt & Teal', primary: '#14213D', accent: '#00A896', paper: '#FFFFFF' },
  { name: 'Monochrome Midnight', primary: '#111827', accent: '#4B5563', paper: '#FFFFFF' },
  { name: 'Premium Platinum', primary: '#333333', accent: '#A0AAB2', paper: '#FFFFFF' },
  { name: 'Signature Navy & Bronze', primary: '#101C31', accent: '#B4846C', paper: '#FFFFFF' },
  { name: 'Elegant Teal & Gold', primary: '#0B3B40', accent: '#D4AF37', paper: '#FFFFFF' },
  { name: 'Modern Indigo & Cyan', primary: '#1E1B4B', accent: '#06B6D4', paper: '#FFFFFF' },
  { name: 'Classic Sepia & Oak', primary: '#3E2723', accent: '#A1887F', paper: '#FFFFFF' },
  { name: 'Financial Blue & Gray', primary: '#1E3A8A', accent: '#94A3B8', paper: '#FFFFFF' },
  { name: 'Architectural Concrete', primary: '#27272A', accent: '#71717A', paper: '#FFFFFF' },
  { name: 'Law Firm Mahogany', primary: '#3E1C1F', accent: '#C5B39A', paper: '#FFFFFF' },
  { name: 'Healthcare Aqua & Slate', primary: '#0F4C5C', accent: '#5C6D70', paper: '#FFFFFF' },
  { name: 'Minimalist Sand & Ebony', primary: '#000000', accent: '#D9C8A9', paper: '#FFFFFF' },
];`;

// We replace the existing THEMES array in data.ts
code = code.replace(/export const THEMES: Theme\[\] = \[\s+[\s\S]*?\];/, newThemes);

fs.writeFileSync('src/data.ts', code);
