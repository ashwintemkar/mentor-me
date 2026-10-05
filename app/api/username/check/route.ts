import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { isUsernameAvailable, normalizeUsername, validateUsernameFormat } from "@/lib/profiles";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const raw = new URL(request.url).searchParams.get("u") ?? "";
  const username = normalizeUsername(raw);
  const formatError = validateUsernameFormat(username);
  if (formatError) {
    return Response.json({ available: false, reason: formatError });
  }

  try {
    const available = await isUsernameAvailable(supabase, username, user.id);
    return Response.json({
      available,
      reason: available ? null : "That username is already taken.",
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
