"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function InviteForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"mentor" | "mentee">("mentee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, requestedRole: role }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(
        role === "mentee"
          ? `Invite sent to @${username} to be your mentee.`
          : `Request sent to @${username} to be your mentor.`
      );
      setUsername("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ marginTop: 16 }}>
        + Invite or request someone
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel" style={{ marginTop: 16 }}>
      <label>
        Their username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="e.g. priya-23"
        />
      </label>
      <label>
        I want them to be my...
        <select value={role} onChange={(e) => setRole(e.target.value as "mentor" | "mentee")}>
          <option value="mentee">Mentee (I'll mentor them)</option>
          <option value="mentor">Mentor (they'll mentor me)</option>
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <div className="row-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
        <button type="button" className="secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
