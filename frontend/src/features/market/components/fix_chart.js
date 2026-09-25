const fs = require('fs');
const path = 'e:\\StockEXE\\DemoStocksim-FullStack-Exe201\\frontend\\src\\features\\market\\components\\ChartArea.tsx';
let content = fs.readFileSync(path, 'utf8');

const conflictRegex = /<<<<<<< HEAD[\s\S]*?=======\n([\s\S]*?)>>>>>>> [a-f0-9]+\n/g;

// Create a version keeping INCOMING
let newContent = content.replace(conflictRegex, '$1');

fs.writeFileSync('e:\\StockEXE\\DemoStocksim-FullStack-Exe201\\frontend\\src\\features\\market\\components\\ChartArea_fixed.tsx', newContent);
console.log("Created ChartArea_fixed.tsx");
