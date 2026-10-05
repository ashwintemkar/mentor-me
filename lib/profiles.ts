import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
};

const USERNAME_RE = /^[a-z][a-z0-9_-]{2,19}$/;

export function validateUsernameFormat(raw: string): string | null {
  const username = raw.trim().toLowerCase();
  if (!username) return "Username is required.";
  if (!USERNAME_RE.test(username)) {
    return "3-20 characters, lowercase letters/numbers/-/_ only, must start with a letter.";
  }
  return null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Returns the current user's profile, or null if they haven't picked a username yet. */
export async function getOwnProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function isUsernameAvailable(
  supabase: SupabaseClient,
  username: string,
  excludingUserId?: string
): Promise<boolean> {
  let query = supabase.from("profiles").select("id").eq("username", username);
  if (excludingUserId) query = query.neq("id", excludingUserId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return !data;
}

export async function setUsername(
  supabase: SupabaseClient,
  user: User,
  rawUsername: string
): Promise<Profile> {
  const username = normalizeUsername(rawUsername);
  const formatError = validateUsernameFormat(username);
  if (formatError) throw new Error(formatError);

  const available = await isUsernameAvailable(supabase, username, user.id);
  if (!available) throw new Error("That username is already taken.");

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, username, display_name: user.user_metadata?.full_name ?? null },
      { onConflict: "id" }
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function findProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizeUsername(username))
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
