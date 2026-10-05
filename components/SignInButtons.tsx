"use client";

import { createClient } from "@/utils/supabase/client";

export default function SignInButtons() {
  const supabase = createClient();

  async function signInWith(provider: "google" | "github") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="signin-row">
      <button onClick={() => signInWith("google")}>Sign in with Google</button>
      <button onClick={() => signInWith("github")}>Sign in with GitHub</button>
    </div>
  );
}
