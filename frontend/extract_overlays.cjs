const fs = require('fs');
const code = fs.readFileSync('node_modules/klinecharts/dist/index.esm.js', 'utf8');
const matches = [...code.matchAll(/name:\s*['"]([a-zA-Z]+)['"]/g)];
console.log(matches.map(m => m[1]));
