"use client";

import { useState, type FormEvent } from "react";

export default function ReviewForm() {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReview("");
    setAudioUrl(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { review: text } = await res.json();
      setReview(text);

      const voiceRes = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (voiceRes.ok) {
        const blob = await voiceRes.blob();
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your mentee's code here..."
          rows={14}
          required
        />
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Reviewing..." : "Review this code"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {review && (
        <div className="review">
          <h2>Written review</h2>
          <pre>{review}</pre>
        </div>
      )}

      {audioUrl && (
        <div className="voice">
          <h2>Spoken review</h2>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
}
