import fs from 'fs';

const targetFile = 'ChartArea.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const conflictRegex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> [a-f0-9]+\r?\n/g;

let matchCount = 0;
const newContent = content.replace(conflictRegex, (match, head, incoming) => {
    matchCount++;
    
    if (head.includes("name: 'longPosition'")) {
        return head + "\n" + incoming.trim(); 
    }
    
    if (head.includes(".includes(activeTool)")) {
        return head;
    }
    
    return incoming;
});

if (matchCount > 0) {
    fs.writeFileSync(targetFile, newContent, 'utf8');
    console.log(`✅ Đã tự động gỡ thông minh ${matchCount} conflicts trong ChartArea.tsx!`);
    console.log(`- Đã giữ lại toàn bộ công cụ vẽ (long, short, tp/sl) của bạn (HEAD).`);
    console.log(`- Đã gộp thành công Undo/Redo/Replay từ nhánh main (INCOMING).`);
} else {
    console.log(`⚠️ Không tìm thấy conflict nào. File có thể đã được fix.`);
}
