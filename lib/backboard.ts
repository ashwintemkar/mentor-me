import { readFile } from "node:fs/promises";
import path from "node:path";
import { BackboardClient } from "backboard-sdk";

function mentorSystemPrompt(styleNotes: string | null) {
  const base =
    "You are reviewing a junior developer's code the way a patient, direct mentor would: " +
    "point out the one or two things that actually matter, explain why, suggest a concrete fix, " +
    "and end with one encouraging line. Keep it under 150 words. No generic praise, no nitpicking everything.";
  if (!styleNotes) return base;
  return (
    base +
    "\n\nMatch this mentor's own review voice, inferred from their past comments:\n" +
    styleNotes
  );
}

async function loadStyleNotes(): Promise<string | null> {
  const file = process.env.FINETUNED_STYLE_NOTES_FILE;
  if (!file) return null;
  try {
    return (await readFile(path.join(process.cwd(), file), "utf-8")).trim();
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    throw new Error("BACKBOARD_API_KEY is not set on the server.");
  }
  if (!client) {
    client = new BackboardClient({ apiKey });
  }
  return client;
}

export async function reviewCode(
  code: string,
  { language = "javascript" }: { language?: string } = {}
): Promise<string> {
  const styleNotes = await loadStyleNotes();
  const systemPrompt = mentorSystemPrompt(styleNotes);

  const response = await getClient().sendMessage({
    content: `${systemPrompt}\n\n---\n\nReview this ${language} code:\n\n${code}`,
    llm_provider: process.env.BACKBOARD_LLM_PROVIDER || "openrouter",
    model_name: process.env.BACKBOARD_MODEL_NAME || "meta-llama/llama-3.3-70b-instruct",
  });

  return response.content;
}
