import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { getConnection, listReviews } from "@/lib/connections";
import MentorReviewForm from "@/components/MentorReviewForm";
import GrowthSummary from "@/components/GrowthSummary";
import ReviewHistory from "@/components/ReviewHistory";

export default async function ConnectionPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const connection = await getConnection(supabase, id);
  if (!connection || (connection.mentor_id !== user.id && connection.mentee_id !== user.id)) {
    notFound();
  }

  const iAmMentor = connection.mentor_id === user.id;
  const other = iAmMentor ? connection.mentee : connection.mentor;
  const reviews = connection.status === "accepted" ? await listReviews(supabase, id) : [];

  return (
    <main className="container">
      <Link href="/dashboard" className="back-link">
        ← Dashboard
      </Link>
      <h1>@{other.username}</h1>
      <p className="muted">{iAmMentor ? "You mentor them" : "They mentor you"}</p>

      {connection.status === "pending" && (
        <p className="muted">This connection is still pending — review history unlocks once accepted.</p>
      )}
      {connection.status === "declined" && <p className="error">This connection was declined.</p>}

      {connection.status === "accepted" && (
        <>
          <GrowthSummary reviews={reviews} />
          <MentorReviewForm connectionId={connection.id} />

          <h2 style={{ marginTop: 32 }}>Review history</h2>
          <ReviewHistory reviews={reviews} />
        </>
      )}
    </main>
  );
}
