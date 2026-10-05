import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SignInButtons from "@/components/SignInButtons";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="container">
      <h1>🧑‍🏫 Mentor Me</h1>
      <p>
        An AI mentor that reviews your mentee&apos;s code the way you actually would,
        reads the feedback out loud, and is fine-tuned on your own past review
        comments so it sounds like you.
      </p>

      {user ? (
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
