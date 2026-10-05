import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
};

function slugFromEmail(email: string | undefined | null): string {
  const local = (email ?? "user").split("@")[0];
  const slug = local.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "user";
}

/** Returns the current user's profile, creating one with a unique username on first visit. */
export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<Profile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return existing;

  const base = slugFromEmail(user.email);
  let username = base;
  let attempt = 0;
  // Try base, then base-2, base-3, ... until we find one that isn't taken.
  while (attempt < 20) {
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (!taken) break;
    attempt += 1;
    username = `${base}-${attempt + 1}`;
  }

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, username, display_name: user.user_metadata?.full_name ?? null })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

export async function findProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
