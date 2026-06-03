import fs from 'fs';
import path from 'path';
import { runLanguageEvolution, runLiteraryScholarship, runMetaphorMapping } from './daily_tasks.js';
import { execSync } from 'child_process';

async function simulate() {
  console.log("=====================================================================");
  console.log("         LINGUISTIC EVOLUTION & STYLE ADAPTATION SIMULATION          ");
  console.log("=====================================================================");

  // 1. Run the parallel research agents
  console.log("\n[Step 1] Executing parallel research agents...");
  const startTime = Date.now();
  try {
    await Promise.all([
      runLanguageEvolution(),
      runLiteraryScholarship(),
      runMetaphorMapping()
    ]);
    console.log(`Parallel tasks succeeded in ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
  } catch (err) {
    console.error("Error executing parallel research agents:", err);
    process.exit(1);
  }

  // 2. Export topics
  console.log("\n[Step 2] Exporting new evolution topics to mark-twain...");
  try {
    execSync('node scripts/export.js', { stdio: 'inherit' });
  } catch (err) {
    console.error("Export script execution failed:", err);
    process.exit(1);
  }

  // 3. Inspect generated files
  console.log("\n[Step 3] Verification & Inspection...");
  const topicsDir = path.join(process.cwd(), 'wiki', 'topics');
  const targetFiles = ['language_evolution.md', 'literary_scholarship.md', 'metaphor_mappings.md'];

  targetFiles.forEach(file => {
    const filePath = path.join(topicsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`\n--- File: ${file} ---`);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').slice(0, 12).join('\n');
      console.log(lines);
      console.log("... (truncated)");
    } else {
      console.error(`Error: File ${file} was not generated!`);
    }
  });

  console.log("\n=====================================================================");
  console.log("             EVOLUTION SIMULATION COMPLETED SUCCESSFULLY             ");
  console.log("=====================================================================");
}

simulate();
