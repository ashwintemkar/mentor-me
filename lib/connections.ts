import type { SupabaseClient } from "@supabase/supabase-js";
import type { StructuredReview } from "./backboard";
import type { Profile } from "./profiles";

export type Connection = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: "pending" | "accepted" | "declined";
  initiated_by: string;
  created_at: string;
  updated_at: string;
};

export type ConnectionWithProfiles = Connection & {
  mentor: Profile;
  mentee: Profile;
};

export type ReviewRow = {
  id: string;
  connection_id: string;
  submitted_by: string;
  language: string | null;
  code: string;
  strengths: string[];
  improvements: StructuredReview["improvements"];
  next_steps: string[];
  raw_response: string | null;
  created_at: string;
};

const WITH_PROFILES = "*, mentor:mentor_id(*), mentee:mentee_id(*)";

export async function listConnections(
  supabase: SupabaseClient,
  userId: string
): Promise<ConnectionWithProfiles[]> {
  const { data, error } = await supabase
    .from("connections")
    .select(WITH_PROFILES)
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ConnectionWithProfiles[];
}

export async function getConnection(
  supabase: SupabaseClient,
  id: string
): Promise<ConnectionWithProfiles | null> {
  const { data, error } = await supabase
    .from("connections")
    .select(WITH_PROFILES)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as ConnectionWithProfiles | null;
}

export async function createConnection(
  supabase: SupabaseClient,
  input: { mentorId: string; menteeId: string; initiatedBy: string }
): Promise<Connection> {
  const { data, error } = await supabase
    .from("connections")
    .insert({
      mentor_id: input.mentorId,
      mentee_id: input.menteeId,
      initiated_by: input.initiatedBy,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function respondToConnection(
  supabase: SupabaseClient,
  id: string,
  status: "accepted" | "declined"
): Promise<Connection> {
  const { data, error } = await supabase
    .from("connections")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listReviews(supabase: SupabaseClient, connectionId: string): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReview(
  supabase: SupabaseClient,
  connectionId: string,
  submittedBy: string,
  input: { language: string; code: string; structured: StructuredReview; raw: string }
): Promise<ReviewRow> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      connection_id: connectionId,
      submitted_by: submittedBy,
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
