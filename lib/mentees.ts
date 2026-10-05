import type { SupabaseClient } from "@supabase/supabase-js";
import type { StructuredReview } from "./backboard";

export type Mentee = {
  id: string;
  mentor_id: string;
  name: string;
  track: string | null;
  level: string | null;
  goals: string | null;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  mentee_id: string;
  language: string | null;
  code: string;
  strengths: string[];
  improvements: StructuredReview["improvements"];
  next_steps: string[];
  raw_response: string | null;
  created_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listMentees(supabase: SupabaseClient): Promise<Mentee[]> {
  const { data, error } = await supabase
    .from("mentees")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMentee(supabase: SupabaseClient, id: string): Promise<Mentee | null> {
  const { data, error } = await supabase.from("mentees").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createMentee(
  supabase: SupabaseClient,
  mentorId: string,
  input: { name: string; track?: string; level?: string; goals?: string }
): Promise<Mentee> {
  const { data, error } = await supabase
    .from("mentees")
    .insert({ mentor_id: mentorId, ...input })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listReviews(supabase: SupabaseClient, menteeId: string): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("mentee_id", menteeId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReview(
  supabase: SupabaseClient,
  menteeId: string,
  input: { language: string; code: string; structured: StructuredReview; raw: string }
): Promise<ReviewRow> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      mentee_id: menteeId,
      language: input.language,
      code: input.code,
      strengths: input.structured.strengths,
      improvements: input.structured.improvements,
      next_steps: input.structured.next_steps,
      raw_response: input.raw,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
