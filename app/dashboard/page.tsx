import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReviewForm from "@/components/ReviewForm";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="container">
      <h1>Review a mentee&apos;s code</h1>
      <p>Signed in as {user.email}</p>
      <ReviewForm />
    </main>
  );
}
