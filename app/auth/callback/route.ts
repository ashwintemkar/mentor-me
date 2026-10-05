import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function resolveBaseUrl(request: Request, origin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return origin;
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${forwardedProto}://${forwardedHost}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const base = resolveBaseUrl(request, origin);
  const code = searchParams.get("code");
  const authError = searchParams.get("error_description") ?? searchParams.get("error");
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
    return NextResponse.redirect(
      `${base}/auth/auth-code-error?reason=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${base}/auth/auth-code-error${authError ? `?reason=${encodeURIComponent(authError)}` : ""}`
  );
}
