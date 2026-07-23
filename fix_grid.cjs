const fs = require('fs');
let dataTs = fs.readFileSync('src/data.ts', 'utf8');

dataTs = dataTs.replace(/Array<'none' \| 'dots' \| 'lines'>/, "Array<'none' | 'dots' | 'lines' | 'repeated-name'>");
dataTs = dataTs.replace(/'lines',/, "'lines',\n  'repeated-name',");
dataTs = dataTs.replace(/'lines': 'Professional Rule Lines',/, "'lines': 'Professional Rule Lines',\n  'repeated-name': 'Repeated Name Background',");

fs.writeFileSync('src/data.ts', dataTs);

let typesTs = fs.readFileSync('src/types.ts', 'utf8');
typesTs = typesTs.replace(/gridStyle: 'none' \| 'dots' \| 'lines'/, "gridStyle: 'none' | 'dots' | 'lines' | 'repeated-name'");
typesTs = typesTs.replace(/gridStyle\?: 'none' \| 'dots' \| 'lines'/, "gridStyle?: 'none' | 'dots' | 'lines' | 'repeated-name'");

fs.writeFileSync('src/types.ts', typesTs);

