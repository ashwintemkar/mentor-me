import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { getOwnProfile } from "@/lib/profiles";
import UsernameForm from "@/components/UsernameForm";

export default async function UsernameOnboarding() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const profile = await getOwnProfile(supabase, user.id);

  return (
    <main className="container">
      <h1>{profile ? "Change your username" : "Pick a username"}</h1>
      <p>
        {profile
          ? "This is how other people find and invite you."
          : "This is how other people will find and invite you to connect."}
      </p>
      <UsernameForm currentUsername={profile?.username} redirectTo="/dashboard" />
    </main>
  );
}
