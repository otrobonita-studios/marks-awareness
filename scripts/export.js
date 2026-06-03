import fs from 'fs';
import path from 'path';

const topicsDir = path.join(process.cwd(), 'wiki', 'topics');
const localExportDir = path.join(process.cwd(), 'wiki', 'export');

// Target directory in the mark-twain workspace
const twainRagDir = 'E:/development/mark-twain/rag/data-collection/TwainCorpus/marks-awareness';

// Ensure local export directory exists
if (!fs.existsSync(localExportDir)) {
  fs.mkdirSync(localExportDir, { recursive: true });
}

function getTopicTitle(content, fileName) {
  // Try to find first H1 header, otherwise use file name
  const match = content.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].trim();
  }
  return fileName.replace('.md', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function exportTopics() {
  if (!fs.existsSync(topicsDir)) {
    console.log("No topics directory found. Run consolidate first.");
    return;
  }

  const files = fs.readdirSync(topicsDir).filter(file => file.endsWith('.md') && file !== '.gitkeep');
  console.log(`Found ${files.length} topics to export.`);

  // We will copy to both local export and mark-twain RAG if it exists
  const hasTwainRag = fs.existsSync(path.dirname(twainRagDir));
  if (hasTwainRag && !fs.existsSync(twainRagDir)) {
    fs.mkdirSync(twainRagDir, { recursive: true });
    console.log(`Created target RAG folder in mark-twain: ${twainRagDir}`);
  }

  files.forEach(file => {
    const filePath = path.join(topicsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const topicId = file.replace('.md', '');
    const title = getTopicTitle(content, file);
    
    // We convert markdown to clean text/markdown representation for indexer
    const textFileName = `${topicId}.txt`;
    const metaFileName = `${topicId}.meta.json`;

    const metadata = {
      id: `wiki-${topicId}`,
      source: "marks-awareness",
      source_url: `https://otrobonita.com/wiki/${topicId}`,
      title: title,
      category: "LLM Wiki Consolidated memory",
      file: textFileName,
      text_file: textFileName,
      exported_at: new Date().toISOString()
    };

    // Write locally
    fs.writeFileSync(path.join(localExportDir, textFileName), content, 'utf8');
    fs.writeFileSync(path.join(localExportDir, metaFileName), JSON.stringify(metadata, null, 2), 'utf8');

    // Write to mark-twain if directory is available
    if (hasTwainRag) {
      fs.writeFileSync(path.join(twainRagDir, textFileName), content, 'utf8');
      fs.writeFileSync(path.join(twainRagDir, metaFileName), JSON.stringify(metadata, null, 2), 'utf8');
    }
  });

  console.log(`Export completed successfully! Saved ${files.length} items to local wiki/export.`);
  if (hasTwainRag) {
    console.log(`Copied ${files.length} items directly to mark-twain RAG under ${twainRagDir}.`);
  } else {
    console.log(`Note: mark-twain RAG directory not found. Consolidated wiki is ready for manual copy.`);
  }
}

exportTopics();
