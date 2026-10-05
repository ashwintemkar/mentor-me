import type { ReviewRow } from "@/lib/connections";

function topThemes(reviews: ReviewRow[], field: "improvements" | "next_steps", limit = 5) {
  const counts = new Map<string, number>();
  for (const review of reviews) {
    const items =
      field === "improvements"
        ? review.improvements.map((i) => i.issue)
        : review.next_steps;
    for (const raw of items) {
      const key = raw.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export default function GrowthSummary({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) return null;

  const recurringIssues = topThemes(reviews, "improvements");
  const recurringNextSteps = topThemes(reviews, "next_steps");

  return (
    <div className="panel">
      <h2>Growth summary</h2>
      <p className="muted">
        Based on {reviews.length} review{reviews.length === 1 ? "" : "s"} so far.
      </p>
      {recurringIssues.length > 0 && (
        <>
          <h3>Recurring things to watch</h3>
          <ul>
            {recurringIssues.map(([issue, count]) => (
              <li key={issue}>
                {issue} {count > 1 && <span className="muted">({count}×)</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      {recurringNextSteps.length > 0 && (
        <>
          <h3>Suggested focus areas</h3>
          <ul>
            {recurringNextSteps.map(([step, count]) => (
              <li key={step}>
                {step} {count > 1 && <span className="muted">({count}×)</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
