import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { getMentee, listReviews, createReview } from "@/lib/mentees";
import { reviewCode } from "@/lib/backboard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const mentee = await getMentee(supabase, id);
    if (!mentee) return new Response("Not found", { status: 404 });
    const reviews = await listReviews(supabase, id);
    return Response.json({ reviews });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const code = typeof body.code === "string" ? body.code : "";
  const language = typeof body.language === "string" ? body.language : "javascript";
  if (!code.trim()) return new Response("Missing code", { status: 400 });

  try {
    const mentee = await getMentee(supabase, id);
    if (!mentee) return new Response("Not found", { status: 404 });

    const menteeContext = [
      `Name: ${mentee.name}`,
      mentee.track ? `Track: ${mentee.track}` : null,
      mentee.level ? `Level: ${mentee.level}` : null,
      mentee.goals ? `Goals: ${mentee.goals}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { structured, raw } = await reviewCode(code, { language, menteeContext });
    const saved = await createReview(supabase, id, { language, code, structured, raw });
    return Response.json({ review: saved });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
