const fs = require('fs');
let dataTs = fs.readFileSync('src/data.ts', 'utf8');

dataTs = dataTs.replace(/lines: 'Light Rule Lines',/, "lines: 'Light Rule Lines',\n  'repeated-name': 'Repeated Name Background',");

fs.writeFileSync('src/data.ts', dataTs);
