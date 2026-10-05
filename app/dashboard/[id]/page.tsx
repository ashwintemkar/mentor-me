import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/utils/supabase/server";
import { getMentee, listReviews } from "@/lib/mentees";
import MentorReviewForm from "@/components/MentorReviewForm";
import GrowthSummary from "@/components/GrowthSummary";
import ReviewHistory from "@/components/ReviewHistory";

export default async function MenteePage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const mentee = await getMentee(supabase, id);
  if (!mentee) {
    notFound();
  }

  const reviews = await listReviews(supabase, id);

  return (
    <main className="container">
      <Link href="/dashboard" className="back-link">
        ← All mentees
      </Link>
      <h1>{mentee.name}</h1>
      <p className="muted">
        {[mentee.track, mentee.level].filter(Boolean).join(" · ") || "No track set"}
      </p>
      {mentee.goals && <p>Goals: {mentee.goals}</p>}

      <GrowthSummary reviews={reviews} />
      <MentorReviewForm menteeId={mentee.id} />

      <h2 style={{ marginTop: 32 }}>Review history</h2>
      <ReviewHistory reviews={reviews} />
    </main>
  );
}
