sed -i '/{\/\* Letterhead Grid \/ Line Toggles \*\//,/<\/div>/c\
          {/* Letterhead Grid / Line Toggles */}\
          <div className="flex flex-col gap-1">\
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider mb-1">\
              Letterhead Grid / Lines\
            </label>\
            <select\
              value={controls.gridStyle}\
              onChange={(e) => handleControlChange("gridStyle", e.target.value as any)}\
              className="px-2 py-1.5 rounded border border-[#DDDEDC] bg-[#FBFBFA] text-[#1C1E22] text-[12px] font-medium outline-none focus:border-[#3B4658] transition-colors"\
            >\
              <option value="random">Random</option>\
              {GRID_STYLES.map((gSty) => (\
                <option key={gSty} value={gSty}>{GRID_STYLE_LABELS[gSty as keyof typeof GRID_STYLE_LABELS]}</option>\
              ))}\
            </select>\
          </div>' src/components/ControlPanel.tsx

sed -i '/{\/\* Paper Texture Toggles \*\//,/<\/div>/c\
          {/* Paper Texture Toggles */}\
          <div className="flex flex-col gap-1">\
            <label className="text-[10px] font-mono text-[#6B7076] uppercase tracking-wider mb-1">\
              Paper Texture\
            </label>\
            <select\
              value={controls.texture}\
              onChange={(e) => handleControlChange("texture", e.target.value as any)}\
              className="px-2 py-1.5 rounded border border-[#DDDEDC] bg-[#FBFBFA] text-[#1C1E22] text-[12px] font-medium outline-none focus:border-[#3B4658] transition-colors"\
            >\
              <option value="random">Random</option>\
              {TEXTURES.map((tex) => (\
                <option key={tex} value={tex}>{TEXTURE_LABELS[tex as keyof typeof TEXTURE_LABELS]}</option>\
              ))}\
            </select>\
          </div>' src/components/ControlPanel.tsx
