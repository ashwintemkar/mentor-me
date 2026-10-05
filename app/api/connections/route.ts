import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { findProfileByUsername } from "@/lib/profiles";
import { createConnection, listConnections } from "@/lib/connections";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const connections = await listConnections(supabase, user.id);
    return Response.json({ connections });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", { status: 500 });
  }
}

/**
 * body: { username: string, requestedRole: "mentor" | "mentee" }
 * requestedRole "mentor" = "I want this person to be MY mentor" (they mentor me)
 * requestedRole "mentee" = "I want to be THIS person's mentor" (I mentor them)
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return new Response("Supabase is not configured on the server", { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const username = typeof body.username === "string" ? body.username : "";
  const requestedRole = body.requestedRole === "mentor" ? "mentor" : "mentee";
  if (!username.trim()) return new Response("Username is required", { status: 400 });

  try {
    const target = await findProfileByUsername(supabase, username);
    if (!target) return new Response("No user with that username", { status: 404 });
    if (target.id === user.id) return new Response("You can't connect with yourself", { status: 400 });

    const mentorId = requestedRole === "mentor" ? target.id : user.id;
    const menteeId = requestedRole === "mentor" ? user.id : target.id;

    const connection = await createConnection(supabase, {
      mentorId,
      menteeId,
      initiatedBy: user.id,
    });
    return Response.json({ connection });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("duplicate key") ? 409 : 500;
    return new Response(
      status === 409 ? "A connection with this person already exists" : message,
      { status }
    );
  }
}
