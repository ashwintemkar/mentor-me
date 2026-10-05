import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { reviewCode } from "./review.js";
import { speak } from "./voice.js";

function loadEnvFile() {
  try {
    const raw = readFileSync(".env", "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && !(key in process.env)) process.env[key] = rest.join("=");
    }
  } catch {
    // no .env file yet — that's fine, caller can export vars directly
  }
}

async function main() {
  loadEnvFile();

  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npm run review -- path/to/code-to-review.js");
    process.exit(1);
  }

  const code = await readFile(filePath, "utf-8");
  console.log("Asking the mentor for a review...\n");
  const review = await reviewCode(code, { language: filePath.split(".").pop() });

  console.log("--- Written review ---\n");
  console.log(review);

  const outPath = "review.mp3";
  console.log("\nTurning it into a spoken walkthrough...");
  await speak(review, outPath);
  console.log(`Saved spoken review to ${outPath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
