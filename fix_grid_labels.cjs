const fs = require('fs');
let code = fs.readFileSync('src/components/ControlPanel.tsx', 'utf8');

// We should find the grid style map in ControlPanel
// {gSty === 'random' ? 'Random' : gSty === 'none' ? 'None' : gSty === 'dots' ? 'Dot Grid' : 'Ruled Lines'}
// and replace it to use GRID_STYLE_LABELS if it exists, or just hardcode the repeated-name

const replacement = "{gSty === 'random' ? 'Random' : gSty === 'none' ? 'None' : gSty === 'dots' ? 'Dot Grid' : gSty === 'lines' ? 'Ruled Lines' : 'Repeated Name'}";

code = code.replace(/\{gSty === 'random' \? 'Random' : gSty === 'none' \? 'None' : gSty === 'dots' \? 'Dot Grid' : 'Ruled Lines'\}/, replacement);

fs.writeFileSync('src/components/ControlPanel.tsx', code);
