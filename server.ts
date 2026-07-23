import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to generate professional design and copy using Gemini AI
app.post("/api/generate-premium-design", async (req, res) => {
  try {
    const rawData = req.body;
    const companyName = rawData.companyName || rawData.companyData?.companyName;
    const industry = rawData.industry || rawData.companyData?.industry || 'corporate';
    const tagline = rawData.tagline || rawData.companyData?.tagline || '';
    const address = rawData.address || rawData.companyData?.address || '';
    const phone = rawData.phone || rawData.companyData?.phone || '';
    const email = rawData.email || rawData.companyData?.email || '';

    if (!companyName) {
      return res.status(400).json({ error: "Company details are required to generate design." });
    }

    // Initialize Gemini SDK with telemetry
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Analyze this company and generate a beautiful, professional, premium letterhead and business visiting card design:
Company Name: ${companyName}
Industry: ${industry}
Tagline: ${tagline}
Address: ${address}
Phone: ${phone}
Email: ${email}`;

    const systemInstruction = `You are a world-class graphic designer and master typographer specializing in premium letterheads (pad) and business visiting cards.
Your task is to analyze the company's brand name, industry, and tagline, and output a highly professional visual identity styling JSON.
Ensure the layout is elegant and never too simple.
Include creative, premium accents and multiple color shades.
Choose high-contrast, beautiful corporate colors:
- primaryColor: deep elegant background/main brand color (hex)
- accentColor: a vibrant, beautiful highlight color (hex)
- paperColor: background paper color in hex format (usually '#FFFFFF' or slightly off-white '#FAF8F5'/'#FCFBF8')
- secondaryColor: a third supporting accent or neutral shade (hex)
- shade2Color: a smooth intermediate shade of the primary color (hex)
- shade3Color: a lighter/cream/tint of the primary or accent color (hex)
- decorations: select a beautiful decoration element to surround or accent the company name at the top of the pad. It must be one of:
  * 'none' (clean, ultra-modern)
  * 'brackets' (elegant typographic bracket design [Name] around the name)
  * 'horizontal-lines' (thin premium accent lines to the left and right of the name)
  * 'subtle-box' (a clean, elegant rectangle box outlining the name)
  * 'top-bottom-dots' (delicate dot patterns above and below the name)
  * 'corner-flourish' (artistic corner bracket ornaments around the header area)
  * 'crest' (a classic, noble crest/badge enclosing the initials)
  * 'modern-accent' (contemporary asymmetrical design lines)
- decorationColor: hex color that coordinates with the primary/accent.
- headlineFontLabel: must exactly match one of these labels:
  'Serif (Classic - Georgia)', 'Serif (Elegant - Cambria)', 'Serif (Palatino)', 'Serif (Garamond)', 'Sans (Montserrat)', 'Sans (Inter)', 'Sans (Playfair Display)', 'Sans (Merriweather)', 'Sans (Oswald)', 'Sans (Roboto)', 'Sans (Lato)', 'Sans (Poppins)', 'Serif (Lora)', 'Sans (Fira Sans)', 'Serif (PT Serif)', 'Serif (Crimson Text)', 'Serif (Cinzel Elegance)', 'Mono (Inconsolata Modern)', 'Sans (Raleway Clean)'
Choose the layout formats wisely:
- recommendedPadLayout: one of 'canva-minimal-blue-gold', 'canva-creative-corporate', 'canva-medical-clean', 'canva-bold-finance', 'canva-organic-abstract', 'canva-bento-modular', 'canva-editorial-luxury', 'canva-colorful-playful', 'canva-tech-isometric'
- recommendedCardLayout: one of 'centered', 'split', 'sideband', 'modern-split', 'minimalist-right', 'dark-accent', 'shield-badge'
- recommendedLogoStyle: one of 'classic', 'typographic', 'bordered', 'shadow-badge'
- recommendedShape: one of 'circle', 'square', 'hexagon', 'diamond', 'shield', 'octagon'
- recommendedGridStyle: one of 'none', 'dots', 'lines'
- textCasing: one of 'title', 'upper', 'lower'`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            designCommentary: { 
              type: Type.STRING, 
              description: "A brief professional explanation of the design concept in Bengali/English mixed (Bangla + English matching the brand vibe)." 
            },
            designAttributes: {
              type: Type.OBJECT,
              properties: {
                primaryColor: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                paperColor: { type: Type.STRING },
                secondaryColor: { type: Type.STRING },
                shade2Color: { type: Type.STRING },
                shade3Color: { type: Type.STRING },
                decorations: { 
                  type: Type.STRING, 
                  enum: ['none', 'brackets', 'horizontal-lines', 'subtle-box', 'top-bottom-dots', 'corner-flourish', 'crest', 'modern-accent'] 
                },
                decorationColor: { type: Type.STRING },
                headlineFontLabel: { 
                  type: Type.STRING,
                  enum: [
                    'Serif (Classic - Georgia)', 'Serif (Elegant - Cambria)', 'Serif (Palatino)', 'Serif (Garamond)', 'Sans (Montserrat)', 'Sans (Inter)', 'Sans (Playfair Display)', 'Sans (Merriweather)', 'Sans (Oswald)', 'Sans (Roboto)', 'Sans (Lato)', 'Sans (Poppins)', 'Serif (Lora)', 'Sans (Fira Sans)', 'Serif (PT Serif)', 'Serif (Crimson Text)', 'Serif (Cinzel Elegance)', 'Mono (Inconsolata Modern)', 'Sans (Raleway Clean)'
                  ]
                },
                recommendedPadLayout: { 
                  type: Type.STRING,
                  enum: [
                    'canva-minimal-blue-gold',
                    'canva-creative-corporate',
                    'canva-medical-clean',
                    'canva-bold-finance',
                    'canva-organic-abstract',
                    'canva-bento-modular',
                    'canva-editorial-luxury',
                    'canva-colorful-playful',
                    'canva-tech-isometric'
                  ]
                },
                recommendedCardLayout: { 
                  type: Type.STRING,
                  enum: ['centered', 'split', 'sideband', 'modern-split', 'minimalist-right', 'dark-accent', 'shield-badge']
                },
                recommendedLogoStyle: { 
                  type: Type.STRING,
                  enum: ['classic', 'typographic', 'bordered', 'shadow-badge']
                },
                recommendedShape: { 
                  type: Type.STRING,
                  enum: ['circle', 'square', 'hexagon', 'diamond', 'shield', 'octagon']
                },
                recommendedGridStyle: { 
                  type: Type.STRING,
                  enum: ['none', 'dots', 'lines']
                },
                textCasing: { 
                  type: Type.STRING,
                  enum: ['title', 'upper', 'lower']
                }
              },
              required: [
                "primaryColor", "accentColor", "paperColor", "secondaryColor", "shade2Color", "shade3Color",
                "decorations", "decorationColor", "headlineFontLabel", "recommendedPadLayout", "recommendedCardLayout", 
                "recommendedLogoStyle", "recommendedShape", "recommendedGridStyle", "textCasing"
              ]
            }
          },
          required: ["designCommentary", "designAttributes"]
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }
    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate premium design using Gemini AI." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
