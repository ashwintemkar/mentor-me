import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import SignInButtons from "@/components/SignInButtons";

export default async function Home() {
  const configured = isSupabaseConfigured();
  const user = configured ? (await (await createClient()).auth.getUser()).data.user : null;

  return (
    <main className="container">
      <h1>🧑‍🏫 Mentor Me</h1>
      <p>
        An AI mentor that reviews your mentee&apos;s code the way you actually would,
        reads the feedback out loud, and is fine-tuned on your own past review
        comments so it sounds like you.
      </p>

      {!configured ? (
        <p className="error">
          Supabase isn&apos;t configured yet — set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.local.example).
        </p>
      ) : user ? (
        <>
          <p>Signed in as {user.email}</p>
          <Link href="/dashboard">
            <button>Go to dashboard →</button>
          </Link>
        </>
      ) : (
        <SignInButtons />
      )}
    </main>
  );
}
