"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type CheckState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function UsernameForm({
  currentUsername,
  redirectTo = "/dashboard",
}: {
  currentUsername?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [username, setUsernameInput] = useState(currentUsername ?? "");
  const [check, setCheck] = useState<CheckState>("idle");
  const [reason, setReason] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const value = username.trim();

    if (!value) {
      setCheck("idle");
      setReason(null);
      return;
    }
    if (value === currentUsername) {
      setCheck("idle");
      setReason(null);
      return;
    }

    setCheck("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(value)}`);
        const data = await res.json();
        setCheck(data.available ? "available" : data.reason?.includes("3-20") ? "invalid" : "taken");
        setReason(data.reason ?? null);
      } catch {
        setCheck("idle");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, currentUsername]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    username.trim().length > 0 &&
    username.trim() !== currentUsername &&
    check !== "checking" &&
    check !== "taken" &&
    check !== "invalid";

  const sameAsCurrent = username.trim() === currentUsername && currentUsername;

  return (
    <form onSubmit={handleSubmit} className="panel">
      <label>
        Username
        <input
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="e.g. priya-23"
          autoFocus
          required
        />
      </label>
      {check === "checking" && <p className="muted">Checking availability...</p>}
      {check === "available" && <p className="success">@{username.trim()} is available.</p>}
      {(check === "taken" || check === "invalid") && <p className="error">{reason}</p>}
      {sameAsCurrent && <p className="muted">This is already your username.</p>}
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={!canSubmit || submitting} style={{ marginTop: 12 }}>
        {submitting ? "Saving..." : currentUsername ? "Update username" : "Claim username"}
      </button>
    </form>
  );
}
