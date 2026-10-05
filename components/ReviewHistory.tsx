import type { ReviewRow } from "@/lib/connections";

export default function ReviewHistory({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return <p className="muted">No reviews yet for this mentee.</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <details key={review.id} className="panel">
          <summary>
            {new Date(review.created_at).toLocaleString()} — {review.language}
            {review.improvements.length > 0 && ` · ${review.improvements.length} item(s) to improve`}
          </summary>
          <pre className="code-preview">{review.code.slice(0, 2000)}</pre>
          {review.strengths.length > 0 && (
            <>
              <h4>Strengths</h4>
              <ul>
                {review.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
          {review.improvements.length > 0 && (
            <>
              <h4>Improvements</h4>
              {review.improvements.map((imp, i) => (
                <div key={i} className="improvement-card">
                  <strong>{imp.issue}</strong>
                  {imp.where && <p className="muted">Where: {imp.where}</p>}
                  {imp.why && <p>Why: {imp.why}</p>}
                  {imp.how_to_fix && <p>Fix: {imp.how_to_fix}</p>}
                </div>
              ))}
            </>
          )}
          {review.next_steps.length > 0 && (
            <>
              <h4>Next steps</h4>
              <ul>
                {review.next_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </details>
      ))}
    </div>
  );
}
