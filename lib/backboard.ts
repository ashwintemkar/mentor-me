import { readFile } from "node:fs/promises";
import path from "node:path";
import { BackboardClient } from "backboard-sdk";

export type StructuredReview = {
  strengths: string[];
  improvements: { issue: string; where: string; why: string; how_to_fix: string }[];
  next_steps: string[];
};

function mentorSystemPrompt(styleNotes: string | null, menteeContext: string | null) {
  const base = `You are a patient, direct mentor guiding a developer's growth, not just linting one file. ` +
    `Given a code submission, respond with ONLY a JSON object (no markdown fences, no prose outside the JSON) matching exactly this shape:
{
  "strengths": string[],            // 1-3 specific things done well, referencing actual code
  "improvements": [                 // 1-4 things that matter most right now, ranked by priority
    { "issue": string, "where": string, "why": string, "how_to_fix": string }
  ],
  "next_steps": string[]            // 1-3 concrete things to learn or practice next, based on this submission
}
Be specific and reference actual lines/patterns from the code. Do not pad with generic advice.`;

  const context = menteeContext ? `\n\nMentee context:\n${menteeContext}` : "";
  const style = styleNotes
    ? `\n\nMatch this mentor's own review voice, inferred from their past comments:\n${styleNotes}`
    : "";
  return base + context + style;
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

function parseStructuredReview(raw: string): StructuredReview {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    const parsed = JSON.parse(cleaned);
    return {
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps : [],
    };
  } catch {
    return {
      strengths: [],
      improvements: [{ issue: "Could not parse structured feedback", where: "", why: "", how_to_fix: "" }],
      next_steps: [],
    };
  }
}

export async function reviewCode(
  code: string,
  { language = "javascript", menteeContext }: { language?: string; menteeContext?: string | null } = {}
): Promise<{ structured: StructuredReview; raw: string }> {
  const styleNotes = await loadStyleNotes();
  const systemPrompt = mentorSystemPrompt(styleNotes, menteeContext ?? null);

  const response = await getClient().sendMessage({
    content: `${systemPrompt}\n\n---\n\nReview this ${language} code:\n\n${code}`,
    llm_provider: process.env.BACKBOARD_LLM_PROVIDER || "openrouter",
    model_name: process.env.BACKBOARD_MODEL_NAME || "meta-llama/llama-3.3-70b-instruct",
  });

  const raw: string = response.content;
  return { structured: parseStructuredReview(raw), raw };
}
