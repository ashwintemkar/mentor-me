import { readFile } from "node:fs/promises";
import path from "node:path";

const BACKBOARD_BASE = "https://app.backboard.io/api";

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

export async function reviewCode(
  code: string,
  { language = "javascript" }: { language?: string } = {}
): Promise<string> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    throw new Error("BACKBOARD_API_KEY is not set on the server.");
  }

  const styleNotes = await loadStyleNotes();
  const systemPrompt = mentorSystemPrompt(styleNotes);

  const res = await fetch(`${BACKBOARD_BASE}/threads/messages`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `${systemPrompt}\n\n---\n\nReview this ${language} code:\n\n${code}`,
      llm_provider: process.env.BACKBOARD_LLM_PROVIDER || "groq",
      model_name: process.env.BACKBOARD_MODEL_NAME || "llama-3.3-70b-versatile",
      stream: "false",
      memory: "Auto",
    }),
  });

  if (!res.ok) {
    throw new Error(`Backboard request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.content || data.message?.content || JSON.stringify(data);
}
