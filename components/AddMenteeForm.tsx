"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddMenteeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [track, setTrack] = useState("");
  const [level, setLevel] = useState("beginner");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mentees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, track, level, goals }),
      });
      if (!res.ok) throw new Error(await res.text());
      setName("");
      setTrack("");
      setGoals("");
      setOpen(false);
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
        + Add a mentee
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel" style={{ marginTop: 16 }}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Priya" />
      </label>
      <label>
        Track / stack
        <input value={track} onChange={(e) => setTrack(e.target.value)} placeholder="e.g. JavaScript, React" />
      </label>
      <label>
        Level
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>
      <label>
        Goals
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={3}
          placeholder="What are they trying to get better at?"
        />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="row-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add mentee"}
        </button>
        <button type="button" className="secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
