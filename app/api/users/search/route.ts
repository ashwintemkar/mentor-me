import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { findProfileByUsername } from "@/lib/profiles";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const username = new URL(request.url).searchParams.get("username") ?? "";
  if (!username.trim()) return new Response("Missing username", { status: 400 });

  try {
    const profile = await findProfileByUsername(supabase, username);
    if (!profile) return new Response("No user with that username", { status: 404 });
    if (profile.id === user.id) {
      return new Response("That's your own username", { status: 400 });
    }
    return Response.json({ profile });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
