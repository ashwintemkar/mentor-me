import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { listMentees, createMentee } from "@/lib/mentees";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const mentees = await listMentees(supabase);
    return Response.json({ mentees });
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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return new Response("Name is required", { status: 400 });

  try {
    const mentee = await createMentee(supabase, user.id, {
      name,
      track: body.track || undefined,
      level: body.level || undefined,
      goals: body.goals || undefined,
    });
    return Response.json({ mentee });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
