import { createClient } from "@/utils/supabase/server";
import { reviewCode } from "@/lib/backboard";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { code, language } = await request.json();
  if (!code || typeof code !== "string") {
    return new Response("Missing code", { status: 400 });
  }

  try {
    const review = await reviewCode(code, { language });
    return Response.json({ review });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Unknown error", {
      status: 500,
    });
  }
}
