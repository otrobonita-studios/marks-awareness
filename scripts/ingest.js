import fs from 'fs';
import path from 'path';

function getTodayString() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function ingest(type, source, content) {
  const today = getTodayString();
  const rawDir = path.join(process.cwd(), 'wiki', 'raw');
  
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }
  
  const filePath = path.join(rawDir, `${today}.md`);
  const timestamp = new Date().toISOString();
  
  let fileContent = '';
  if (!fs.existsSync(filePath)) {
    fileContent = `# Raw Activity Log - ${today}\n\n`;
  } else {
    fileContent = fs.readFileSync(filePath, 'utf8');
  }
  
  const entry = `## [${timestamp}] Type: ${type} | Source: ${source}\n${content}\n\n---\n\n`;
  fileContent += entry;
  
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`Successfully ingested entry to ${filePath}`);
  return filePath;
}

// Support direct CLI usage
if (process.argv[1] && process.argv[1].endsWith('ingest.js')) {
  const args = process.argv.slice(2);
  let type = 'chat';
  let source = 'cli';
  let content = '';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && args[i+1]) {
      type = args[i+1];
      i++;
    } else if (args[i] === '--source' && args[i+1]) {
      source = args[i+1];
      i++;
    } else if (args[i] === '--content' && args[i+1]) {
      content = args[i+1];
      i++;
    }
  }
  
  if (!content) {
    console.error('Error: --content argument is required.');
    process.exit(1);
  }
  
  ingest(type, source, content);
}
