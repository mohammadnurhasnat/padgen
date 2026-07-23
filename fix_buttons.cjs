const fs = require('fs');
let code = fs.readFileSync('src/components/ControlPanel.tsx', 'utf8');

const replacement = `
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPrintPad}
              className="border border-[#DDDEDC] text-[#3B4658] rounded py-1.5 px-2 text-[11.5px] font-semibold hover:bg-[#F2F3F1] transition-colors duration-150 cursor-pointer"
            >
              Print Pad PDF
            </button>
            <button
              onClick={onPrintCard}
              className="border border-[#DDDEDC] text-[#3B4658] rounded py-1.5 px-2 text-[11.5px] font-semibold hover:bg-[#F2F3F1] transition-colors duration-150 cursor-pointer"
            >
              Print Card PDF
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDownloadPadPNG}
              className="border border-[#DDDEDC] bg-[#E8F0FE] text-[#1967D2] rounded py-1.5 px-2 text-[11.5px] font-semibold hover:bg-[#D2E3FC] transition-colors duration-150 cursor-pointer"
            >
              Download Pad PNG
            </button>
            <button
              onClick={onDownloadCardPNG}
              className="border border-[#DDDEDC] bg-[#E8F0FE] text-[#1967D2] rounded py-1.5 px-2 text-[11.5px] font-semibold hover:bg-[#D2E3FC] transition-colors duration-150 cursor-pointer"
            >
              Download Card PNG
            </button>
          </div>
`;

// Replace the old div containing the print buttons with the new one
code = code.replace(/<div className="grid grid-cols-2 gap-2">\s*<button\s*onClick=\{onPrintPad\}[\s\S]*?Print Card PDF\s*<\/button>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/ControlPanel.tsx', code);
