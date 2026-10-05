import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { ensureProfile } from "@/lib/profiles";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const profile = await ensureProfile(supabase, user);
    return Response.json({ profile });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
