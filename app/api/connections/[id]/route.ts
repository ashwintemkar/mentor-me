import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { getConnection, respondToConnection } from "@/lib/connections";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const status = body.status === "accepted" || body.status === "declined" ? body.status : null;
  if (!status) return new Response("status must be accepted or declined", { status: 400 });

  try {
    const existing = await getConnection(supabase, id);
    if (!existing) return new Response("Not found", { status: 404 });
    if (existing.initiated_by === user.id) {
      return new Response("You can't respond to your own invite", { status: 400 });
    }
    const connection = await respondToConnection(supabase, id, status);
    return Response.json({ connection });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}
