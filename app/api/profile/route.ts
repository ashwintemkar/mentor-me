import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { getOwnProfile, setUsername } from "@/lib/profiles";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const profile = await getOwnProfile(supabase, user.id);
    return Response.json({ profile });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const username = typeof body.username === "string" ? body.username : "";

  try {
    const profile = await setUsername(supabase, user, username);
    return Response.json({ profile });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 400 });
  }
}
