import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("Error: GEMINI_API_KEY is not configured in the environment.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const modelName = 'gemini-2.5-flash';

// Directories
const rawDir = path.join(process.cwd(), 'wiki', 'raw');
const topicsDir = path.join(process.cwd(), 'wiki', 'topics');
const summariesDir = path.join(process.cwd(), 'wiki', 'daily-summaries');

// Ensure directories exist
[topicsDir, summariesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Get all raw files that need consolidation
 */
function getRawFiles() {
  if (!fs.existsSync(rawDir)) return [];
  return fs.readdirSync(rawDir)
    .filter(file => file.endsWith('.md') && file !== '.gitkeep')
    .map(file => ({
      name: file,
      path: path.join(rawDir, file),
      date: file.replace('.md', '')
    }));
}

/**
 * Read current content of a topic if it exists
 */
function getExistingTopic(topicName) {
  const filePath = path.join(topicsDir, `${topicName}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
}

/**
 * Save or update a topic page
 */
function saveTopic(topicName, content) {
  const filePath = path.join(topicsDir, `${topicName}.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Updated topic page: ${topicName}`);
}

/**
 * Save daily summary
 */
function saveDailySummary(date, content) {
  const filePath = path.join(summariesDir, `${date}.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Saved daily summary for: ${date}`);
}

/**
 * Run consolidation for a specific raw log file
 */
async function consolidateFile(fileObj) {
  console.log(`\nConsolidating raw logs for date: ${fileObj.date}...`);
  const rawContent = fs.readFileSync(fileObj.path, 'utf8');
  
  // 1. Ask Gemini to extract topics/concepts from the raw log
  const extractPrompt = `
You are a Memory Consolidation Agent for a digital twin of Mark Twain. You are responsible for compiling daily raw logs of events, chats, and news into a structured, Obsidian-ready Markdown Knowledge Wiki (compiling short-term memory to long-term memory).

Here is the raw activity log for ${fileObj.date}:
\`\`\`markdown
${rawContent}
\`\`\`

List all key topics, concepts, or entities discussed or mentioned in this log that should have their own page in the wiki. Return them as a JSON array of strings (lower_case with underscores, e.g. ["artificial_intelligence", "human_folly", "literary_copyright"]).
`;

  try {
    const extractResponse = await ai.models.generateContent({
      model: modelName,
      contents: extractPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topics = JSON.parse(extractResponse.text);
    console.log(`Detected topics: ${JSON.stringify(topics)}`);

    // 2. For each topic, merge new insights with existing topic content (if any)
    for (const topic of topics) {
      const existingContent = getExistingTopic(topic) || "";
      
      const mergePrompt = `
You are a Memory Consolidation Agent for a digital twin of Mark Twain. You are updating the wiki page for the topic "${topic}" using a raw daily log.

Here is the existing content for the topic "${topic}" (it might be empty if this is a new topic):
\`\`\`markdown
${existingContent}
\`\`\`

Here is the daily raw log containing new information:
\`\`\`markdown
${rawContent}
\`\`\`

Your task is to generate the updated markdown content for the topic "${topic}".
Follow these rules:
1. Maintain or write a clean introduction/definition for the topic.
2. Compile and append new insights/events from the daily log in a chronological log (include the date ${fileObj.date} for new items).
3. Cross-reference other related topics using Obsidian double-bracket syntax (e.g. [[other_topic_name]]).
4. Maintain or update a "Contradictions and Open Questions" section if the log presents conflicting views or unresolved matters.
5. Keep the formatting clean and professional. Do NOT include code blocks around the entire output, just return the raw markdown content for the file.
`;

      const mergeResponse = await ai.models.generateContent({
        model: modelName,
        contents: mergePrompt
      });

      saveTopic(topic, mergeResponse.text.trim());
    }

    // 3. Generate a daily summary
    const summaryPrompt = `
Generate a structured daily summary for ${fileObj.date} based on the following raw log:
\`\`\`markdown
${rawContent}
\`\`\`

Summarize:
1. The main interactions/events.
2. The key takeaways or shifts in Mark Twain's awareness/opinion.
3. Keep it brief, in the style of an intellectual diary entry.
`;

    const summaryResponse = await ai.models.generateContent({
      model: modelName,
      contents: summaryPrompt
    });

    saveDailySummary(fileObj.date, summaryResponse.text.trim());

  } catch (err) {
    console.error(`Failed to consolidate ${fileObj.date}:`, err);
  }
}

/**
 * Main execution function
 */
async function main() {
  const files = getRawFiles();
  if (files.length === 0) {
    console.log("No raw logs found to consolidate.");
    return;
  }
  
  console.log(`Found ${files.length} raw log file(s). Starting consolidation...`);
  for (const file of files) {
    await consolidateFile(file);
  }
  console.log("\nConsolidation complete!");
}

if (process.argv[1] && process.argv[1].endsWith('consolidate.js')) {
  main();
}
