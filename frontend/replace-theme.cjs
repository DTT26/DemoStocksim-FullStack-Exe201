const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts'),
];

// Map of old Tailwind classes to new dark theme classes
const REPLACEMENTS = [
  { old: 'bg-white', new: 'bg-[#1e222d]' },
  { old: 'bg-[#F7F9FC]', new: 'bg-[#0b0e14]' }, // main layout bg
  { old: 'text-slate-900', new: 'text-white' },
  { old: 'text-gray-900', new: 'text-white' },
  { old: 'text-slate-500', new: 'text-[#787b86]' },
  { old: 'text-gray-600', new: 'text-[#787b86]' },
  { old: 'text-slate-600', new: 'text-[#787b86]' },
  { old: 'text-slate-700', new: 'text-[#d1d4dc]' },
  { old: 'text-slate-800', new: 'text-[#d1d4dc]' },
  { old: 'bg-slate-50', new: 'bg-[#131722]' },
  { old: 'bg-gray-50', new: 'bg-[#131722]' },
  { old: 'bg-slate-100', new: 'bg-[#2a2e39]' },
  { old: 'bg-gray-100', new: 'bg-[#2a2e39]' },
  { old: 'bg-slate-200', new: 'bg-[#2a2e39]' },
  { old: 'border-slate-200', new: 'border-[#2a2e39]' },
  { old: 'border-gray-200', new: 'border-[#2a2e39]' },
  { old: 'border-slate-100', new: 'border-[#2a2e39]' },
  { old: 'border-slate-300', new: 'border-[#2a2e39]' },
  { old: 'divide-slate-100', new: 'divide-[#2a2e39]' },
  { old: 'divide-slate-200', new: 'divide-[#2a2e39]' },
  { old: 'hover:bg-slate-50', new: 'hover:bg-[#2a2e39]' },
  { old: 'hover:bg-gray-100', new: 'hover:bg-[#2a2e39]' },
  { old: 'hover:bg-slate-100', new: 'hover:bg-[#2a2e39]' },
  { old: 'hover:bg-slate-200', new: 'hover:bg-[#2a2e39]' },
  { old: 'hover:text-slate-700', new: 'hover:text-white' },
  { old: 'hover:text-gray-900', new: 'hover:text-white' },
  { old: 'text-slate-400', new: 'text-[#787b86]' }
];

function processFile(filePath) {
  // Do not process TradingTerminal or UserDropdown since they are already dark
  if (filePath.includes('TradingTerminal') || filePath.includes('UserDropdown') || filePath.includes('ToolbarNavbar')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  REPLACEMENTS.forEach(repl => {
    // We use a regex with word boundaries to ensure we match exact class names
    // However, tailwind classes often have hyphens and brackets, so boundary matching can be tricky.
    // Given the uniqueness of these classes, a global string replacement might suffice,
    // but let's be careful.
    
    // Instead of regex word boundaries, we can just do a split and join.
    if (content.includes(repl.old)) {
      // Split on the old class. But wait, what if it's 'bg-white/50'? 
      // We can use a regex to ensure it's not followed by a slash or dash.
      const regex = new RegExp(`(?<![a-zA-Z0-9-])` + repl.old.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + `(?![a-zA-Z0-9-/#])`, 'g');
      content = content.replace(regex, repl.new);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    traverseDirectory(dir);
  }
});

console.log('Theme conversion completed.');
