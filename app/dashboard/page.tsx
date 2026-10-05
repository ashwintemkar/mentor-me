import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { listMentees } from "@/lib/mentees";
import MenteeList from "@/components/MenteeList";
import AddMenteeForm from "@/components/AddMenteeForm";
import SignOutButton from "@/components/SignOutButton";

export default async function Dashboard() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const mentees = await listMentees(supabase);

  return (
    <main className="container">
      <div className="header-row">
        <div>
          <h1>Your mentees</h1>
          <p>Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <MenteeList mentees={mentees} />
      <AddMenteeForm />
    </main>
  );
}
