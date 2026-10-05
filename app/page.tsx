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
        A guide for every mentee you&apos;re growing, not just a linter. Track each
        person, get structured feedback — strengths, what to fix and why, what to
        learn next — and watch recurring patterns surface over time. Fine-tuned on
        your own past review comments so it sounds like you.
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
