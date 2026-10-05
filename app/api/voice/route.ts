import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { synthesizeSpeech } from "@/lib/elevenlabs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { text } = await request.json();
  if (!text || typeof text !== "string") {
    return new Response("Missing text", { status: 400 });
  }

  try {
    const audio = await synthesizeSpeech(text);
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", {
      status: 500,
    });
  }
}
