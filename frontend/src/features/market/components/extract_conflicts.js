const fs = require('fs');
const path = 'e:\\StockEXE\\DemoStocksim-FullStack-Exe201\\frontend\\src\\features\\market\\components\\ChartArea.tsx';
let content = fs.readFileSync(path, 'utf8');

const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [a-f0-9]+\n/g;
let match;
let conflicts = [];
while ((match = conflictRegex.exec(content)) !== null) {
  conflicts.push({
    head: match[1],
    incoming: match[2]
  });
}

fs.writeFileSync('e:\\StockEXE\\DemoStocksim-FullStack-Exe201\\frontend\\src\\features\\market\\components\\conflicts.json', JSON.stringify(conflicts, null, 2));
