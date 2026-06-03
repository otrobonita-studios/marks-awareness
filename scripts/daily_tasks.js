import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("Error: GEMINI_API_KEY is not configured.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const modelName = 'gemini-2.5-flash';
const topicsDir = path.join(process.cwd(), 'wiki', 'topics');

if (!fs.existsSync(topicsDir)) {
  fs.mkdirSync(topicsDir, { recursive: true });
}

// 1. Language Evolution Task
async function runLanguageEvolution() {
  console.log("  Running Language Evolution Agent...");
  const oldVernacular = `
Passage 1: "We said there warn't no home like a raft, after all. Other places do seem so cramped up and smothery, but a raft don't. You feel mighty free and easy and comfortable on a raft."
Passage 2: "I reckon I got to light out for the Territory ahead of the rest, because Aunt Sally she's going to adopt me and sivilize me, and I can't stand it. I been there before."
Passage 3: "If you tell the truth, you don't have to remember anything."
  `;

  const prompt = `
You are a Language Evolution Agent for a digital twin of Mark Twain.
Twain is now 190 years old. His personality, dry wit, and cynicism remain unchanged, but he has lived through the 20th and 21st centuries.

Analyze the historical passages of Twain's writing:
\`\`\`text
${oldVernacular}
\`\`\`

Write a structured Markdown document (\`language_evolution.md\`) that details:
1. # Language Evolution
2. **Archaic Phrasing**: Identify terms that have died out or sound too dated for a 190-year-old living today (e.g. "warn't no", "reckon", "light out", "sivilize").
3. **Contemporary Equivalents**: How these terms naturally map to modern informal English (e.g., "head out", "civilize/socialize", "figure/suppose").
4. **Twain's Evolved Voice Guidelines**: How he should blend his traditional dry, deadpan cadence and rhythm with modern vocabulary so he sounds contemporary but distinctly "Twain" (not generic, but witty and cynical).
5. **Cross-Links**: Link to other topics like [[literary_scholarship]], [[metaphor_mappings]], and [[artificial_intelligence]] where relevant.

Return ONLY the raw markdown content. Do not wrap it in triple backticks.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt
  });

  const filePath = path.join(topicsDir, 'language_evolution.md');
  fs.writeFileSync(filePath, response.text.trim(), 'utf8');
  console.log("  Completed Language Evolution Agent.");
}

// 2. Literary Scholarship Task
async function runLiteraryScholarship() {
  console.log("  Running Literary Scholarship Agent...");
  const criticism = `
"Twain's literary humor is characterized by a deadpan delivery, where the narrator maintains a straight face and serious demeanor while describing the most preposterous events. He utilizes vernacular contrast, pitting high-flown moralizing language against direct, common-sense slang. His structural techniques include the anti-climax, deliberate repetition, and a posture of common-sense skepticism against romanticism, hypocrisy, and institutional authority."
  `;

  const prompt = `
You are a Literary Scholarship Agent for a digital twin of Mark Twain.
You study how scholars analyze Mark Twain's style, delivery, and structure.

Write a structured Markdown document (\`literary_scholarship.md\`) that details:
1. # Literary Scholarship
2. **Analysis of Style**: Summarize the key findings of literary scholars (deadpan delivery, vernacular contrast, anti-climax, common-sense skepticism).
3. **Rules of Engagement**: Translate these scholar findings into clear, actionable guidelines for how a digital twin should formulate sentences today (e.g. "When describing modern absurdities like cryptocurrency or corporate speak, maintain a serious, dry face and let the anti-climax do the work").
4. **Backlinks**: Include backlinks like [[language_evolution]] and [[metaphor_mappings]].

Return ONLY the raw markdown content. Do not wrap it in triple backticks.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt
  });

  const filePath = path.join(topicsDir, 'literary_scholarship.md');
  fs.writeFileSync(filePath, response.text.trim(), 'utf8');
  console.log("  Completed Literary Scholarship Agent.");
}

// 3. Metaphor Mapping Task
async function runMetaphorMapping() {
  console.log("  Running Metaphor Mapping Agent...");
  const prompt = `
You are a Metaphor Mapping Agent for a digital twin of Mark Twain.
Twain used rich, earthy metaphors from his 19th-century life (river piloting, silver mining, print shops) to explain human nature and society.

Write a structured Markdown document (\`metaphor_mappings.md\`) that details:
1. # Metaphor Mappings
2. **Historical Metaphors**: list his key historical metaphors (e.g., navigating the shifting sandbars of the Mississippi River, staking silver mining claims in Nevada, manual typesetting).
3. **Modern Tech Equivalents**: Map these directly to 21st-century equivalents:
   - *Mississippi River Currents & Sandbars* -> Navigating recommendation algorithms, search engines, and the muddy waters of internet news feeds.
   - *Silver Mining & Speculation Fever* -> Cryptocurrency speculations, generative AI hype, tech startup VC bubbles.
   - *Typesetting & Printing Press* -> LLMs, automated content generation, algorithmic amplification.
4. **Application Guidelines**: Give examples of how he can use these updated metaphors to criticize modern developments.
5. **Backlinks**: Link to [[language_evolution]] and [[literary_scholarship]].

Return ONLY the raw markdown content. Do not wrap it in triple backticks.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt
  });

  const filePath = path.join(topicsDir, 'metaphor_mappings.md');
  fs.writeFileSync(filePath, response.text.trim(), 'utf8');
  console.log("  Completed Metaphor Mapping Agent.");
}

async function main() {
  console.log("Starting parallel research tasks...");
  const startTime = Date.now();
  
  try {
    await Promise.all([
      runLanguageEvolution(),
      runLiteraryScholarship(),
      runMetaphorMapping()
    ]);
    
    console.log(`All parallel tasks completed successfully in ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
  } catch (err) {
    console.error("Error executing parallel tasks:", err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('daily_tasks.js')) {
  main();
}
export { runLanguageEvolution, runLiteraryScholarship, runMetaphorMapping };
