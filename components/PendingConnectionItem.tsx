"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConnectionWithProfiles } from "@/lib/connections";

export default function PendingConnectionItem({
  connection,
  currentUserId,
}: {
  connection: ConnectionWithProfiles;
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isIncoming = connection.initiated_by !== currentUserId;
  const iAmMentor = connection.mentor_id === currentUserId;
  const other = iAmMentor ? connection.mentee : connection.mentor;
  const roleLabel = iAmMentor ? "wants you to mentor them" : "wants to mentor you";

  async function respond(status: "accepted" | "declined") {
    setLoading(true);
    try {
      const res = await fetch(`/api/connections/${connection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pending-item">
      <span>
        <strong>@{other.username}</strong>{" "}
        <span className="muted">{isIncoming ? roleLabel : "— request sent, awaiting response"}</span>
      </span>
      {isIncoming && (
        <div className="row-buttons" style={{ marginTop: 0 }}>
          <button disabled={loading} onClick={() => respond("accepted")}>
            Accept
          </button>
          <button disabled={loading} className="secondary" onClick={() => respond("declined")}>
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
