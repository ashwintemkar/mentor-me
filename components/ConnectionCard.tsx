import Link from "next/link";
import type { ConnectionWithProfiles } from "@/lib/connections";

export default function ConnectionCard({
  connection,
  currentUserId,
}: {
  connection: ConnectionWithProfiles;
  currentUserId: string;
}) {
  const iAmMentor = connection.mentor_id === currentUserId;
  const other = iAmMentor ? connection.mentee : connection.mentor;

  return (
    <Link href={`/dashboard/${connection.id}`} className="mentee-card">
      <strong>@{other.username}</strong>
      <span className="muted">{iAmMentor ? "You mentor them" : "They mentor you"}</span>
    </Link>
  );
}
