import Link from "next/link";
import type { Mentee } from "@/lib/mentees";

export default function MenteeList({ mentees }: { mentees: Mentee[] }) {
  if (mentees.length === 0) {
    return <p>No mentees yet — add one below to start tracking their growth.</p>;
  }

  return (
    <div className="mentee-grid">
      {mentees.map((m) => (
        <Link key={m.id} href={`/dashboard/${m.id}`} className="mentee-card">
          <strong>{m.name}</strong>
          <span className="muted">
            {[m.track, m.level].filter(Boolean).join(" · ") || "No track set"}
          </span>
        </Link>
      ))}
    </div>
  );
}
