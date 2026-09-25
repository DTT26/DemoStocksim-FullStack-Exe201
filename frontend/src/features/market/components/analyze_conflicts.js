const fs = require('fs');
const path = 'e:\\StockEXE\\DemoStocksim-FullStack-Exe201\\frontend\\src\\features\\market\\components\\ChartArea.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find all conflicts
const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [a-f0-9]+\n/g;
let match;
let conflicts = [];
while ((match = conflictRegex.exec(content)) !== null) {
  conflicts.push({
    head: match[1],
    incoming: match[2],
    index: match.index,
    length: match[0].length
  });
}

console.log(`Found ${conflicts.length} conflicts.`);
if (conflicts.length > 0) {
  // Let's just print the first 5 conflicts briefly to understand them
  for (let i=0; i<Math.min(5, conflicts.length); i++) {
    console.log(`\n--- Conflict ${i+1} ---`);
    console.log("HEAD:");
    console.log(conflicts[i].head.substring(0, 200) + "...");
    console.log("INCOMING:");
    console.log(conflicts[i].incoming.substring(0, 200) + "...");
  }
}
