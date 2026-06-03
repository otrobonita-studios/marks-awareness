import fs from 'fs';
import path from 'path';
import { ingest } from './ingest.js';
import { execSync } from 'child_process';

console.log("=====================================================================");
console.log("             LLM WIKI & MEMORY CONSOLIDATION SIMULATION              ");
console.log("=====================================================================");

// Step 1: Ingest mock inputs
console.log("\n[Step 1] Ingesting raw inputs (Short-Term Memory)...");

// Ingest chat log
const chatLog = `User: Hello Mark. Have you heard about this new phenomenon called 'Artificial Intelligence' and 'ChatGPT'? They say these models can write stories, poems, and letters in seconds.
Mark Twain: Aye, I have heard tell of it. It sounds to me like a modern steam-powered loom for sentences. A clever apparatus that weaves words together, stealing the threads from every author who ever spun a line, yet possessing no more soul or original wit than a brass sewing machine. It is a grand counterfeiter, mimicking the voice of humanity without ever having shed a tear or laughed a genuine laugh.
User: Many writers are suing the makers of these models for copyright infringement.
Mark Twain: And right they are! I spent a lifetime fighting for the copyright of authors, both in America and across the sea. To have a mechanical syndicate scoop up a man's brain, run it through their digital grist-mill, and sell the flour as their own is the grandest plagiarism ever conceived by human greed. They are renting our own brains back to us!`;

ingest('chat', 'User Interaction', chatLog);

// Ingest RSS news feeds
const newsLog = `Headline: Authors Guild Files Class Action Suit Against OpenAI Over Copyright Infringement
Source: Associated Press RSS
Content: A group of prominent authors has filed a lawsuit in federal court, alleging that OpenAI used their copyrighted novels to train its ChatGPT language model without permission or compensation.

Headline: Tech Giants Debate Safe Harbor Rules for Generative AI Models
Source: Reuters RSS
Content: Tech companies argue that training AI models on public internet text constitutes 'fair use' under copyright law, while publishers call for licensing fees.`;

ingest('news', 'RSS Feed Ingest', newsLog);

// Step 2: Run consolidation script
console.log("\n[Step 2] Running consolidation agent (Hippocampus -> sleep/dream phase)...");
try {
  execSync('node scripts/consolidate.js', { stdio: 'inherit' });
} catch (err) {
  console.error("Consolidation run failed:", err);
  process.exit(1);
}

// Step 3: Run export script
console.log("\n[Step 3] Running RAG export pipeline (compiling to Neocortex)...");
try {
  execSync('node scripts/export.js', { stdio: 'inherit' });
} catch (err) {
  console.error("Export run failed:", err);
  process.exit(1);
}

// Step 4: Verify outputs and print summary
console.log("\n[Step 4] Verification & Inspection...");

const topicsDir = path.join(process.cwd(), 'wiki', 'topics');
const summariesDir = path.join(process.cwd(), 'wiki', 'daily-summaries');

if (fs.existsSync(summariesDir)) {
  const summaryFiles = fs.readdirSync(summariesDir).filter(f => f.endsWith('.md'));
  if (summaryFiles.length > 0) {
    const latestSummary = summaryFiles[summaryFiles.length - 1];
    console.log(`\n--- Latest Daily Summary (${latestSummary}) ---`);
    console.log(fs.readFileSync(path.join(summariesDir, latestSummary), 'utf8'));
  }
}

if (fs.existsSync(topicsDir)) {
  const topicFiles = fs.readdirSync(topicsDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');
  console.log(`\n--- Consolidated Topics Vault (${topicFiles.length} pages) ---`);
  topicFiles.forEach(file => {
    console.log(`\n--- Topic: ${file} ---`);
    const content = fs.readFileSync(path.join(topicsDir, file), 'utf8');
    // Print first 15 lines of each topic to demonstrate structure and cross-links
    const lines = content.split('\n').slice(0, 15).join('\n');
    console.log(lines);
    if (content.split('\n').length > 15) {
      console.log("... (truncated)");
    }
  });
}

console.log("\n=====================================================================");
console.log("                     SIMULATION COMPLETED RUN                        ");
console.log("=====================================================================");
