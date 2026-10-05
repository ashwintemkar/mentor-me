import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { ensureProfile } from "@/lib/profiles";
import { listConnections } from "@/lib/connections";
import ConnectionCard from "@/components/ConnectionCard";
import PendingConnectionItem from "@/components/PendingConnectionItem";
import InviteForm from "@/components/InviteForm";
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

  const profile = await ensureProfile(supabase, user);
  const connections = await listConnections(supabase, user.id);

  const mentoring = connections.filter((c) => c.status === "accepted" && c.mentor_id === user.id);
  const beingMentored = connections.filter((c) => c.status === "accepted" && c.mentee_id === user.id);
  const pending = connections.filter((c) => c.status === "pending");

  return (
    <main className="container">
      <div className="header-row">
        <div>
          <h1>Hey, @{profile.username}</h1>
          <p>Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {pending.length > 0 && (
        <div className="panel">
          <h2>Pending</h2>
          {pending.map((c) => (
            <PendingConnectionItem key={c.id} connection={c} currentUserId={user.id} />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 28 }}>People you mentor</h2>
      {mentoring.length === 0 ? (
        <p className="muted">Nobody yet — invite someone below.</p>
      ) : (
        <div className="mentee-grid">
          {mentoring.map((c) => (
            <ConnectionCard key={c.id} connection={c} currentUserId={user.id} />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 28 }}>People mentoring you</h2>
      {beingMentored.length === 0 ? (
        <p className="muted">Nobody yet — request a mentor below.</p>
      ) : (
        <div className="mentee-grid">
          {beingMentored.map((c) => (
            <ConnectionCard key={c.id} connection={c} currentUserId={user.id} />
          ))}
        </div>
      )}

      <InviteForm />
    </main>
  );
}
