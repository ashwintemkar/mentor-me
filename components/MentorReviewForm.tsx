"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { StructuredReview } from "@/lib/backboard";

const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  go: "go",
  java: "java",
  cs: "csharp",
  cpp: "cpp",
  c: "c",
  rs: "rust",
  php: "php",
};

export default function MentorReviewForm({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StructuredReview | null>(null);
  const [reviewedCode, setReviewedCode] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (EXT_TO_LANG[ext]) setLanguage(EXT_TO_LANG[ext]);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCode(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function clearFile() {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { review } = await res.json();
      setResult({
        strengths: review.strengths,
        improvements: review.improvements,
        next_steps: review.next_steps,
      });
      setReviewedCode(code);
      setCode("");
      clearFile();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Review new code</h2>
      <form onSubmit={handleSubmit}>
        <div className="row-buttons" style={{ marginBottom: 8 }}>
          <label className="file-label">
            {fileName ? `📄 ${fileName}` : "Upload a file (used once, not stored)"}
            <input ref={fileInputRef} type="file" onChange={handleFileChange} hidden />
          </label>
          {fileName && (
            <button type="button" className="secondary" onClick={clearFile}>
              Clear file
            </button>
          )}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {Object.values(EXT_TO_LANG)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
          </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste code, or upload a file above..."
          rows={12}
          required
        />
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Reviewing..." : "Get mentor feedback"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="review-result">
          {reviewedCode && (
            <details>
              <summary className="muted">Code this feedback refers to</summary>
              <pre className="code-preview">{reviewedCode}</pre>
            </details>
          )}
          {result.strengths.length > 0 && (
            <>
              <h3>✅ Strengths</h3>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
          {result.improvements.length > 0 && (
            <>
              <h3>🔧 Things to improve</h3>
              {result.improvements.map((imp, i) => (
                <div key={i} className="improvement-card">
                  <strong>{imp.issue}</strong>
                  {imp.where && <p className="muted">Where: {imp.where}</p>}
                  {imp.why && <p>Why it matters: {imp.why}</p>}
                  {imp.how_to_fix && <p>Fix: {imp.how_to_fix}</p>}
                </div>
              ))}
            </>
          )}
          {result.next_steps.length > 0 && (
            <>
              <h3>🧭 Next steps</h3>
              <ul>
                {result.next_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
