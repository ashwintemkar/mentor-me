# Mentor Me 🧑‍🏫

An AI mentor that reviews my mentee's code the way I actually would, reads the feedback out loud, and is fine-tuned on my own past review comments so it sounds like me — not a generic bot.

**Live:** https://mentor-me.ashwintemkar.com
**Repo:** https://github.com/ashwintemkar/mentor-me

## The friend

I informally mentor a junior developer — reviewing her PRs, answering "why would you do it this way" questions whenever I have a free minute, which is inconsistent and usually late at night. Mentor Me reviews her code on her schedule, writes it up, and reads it back to her in a short voice note, so she's never stuck waiting on me — and it still sounds like *my* feedback.

## How it's built

A Next.js (TypeScript, App Router) web app:

- **[Supabase Auth](https://supabase.com)** — sign-in with Google or GitHub, session handled server-side via `@supabase/ssr`.
- **[Backboard](https://backboard.io)** (`backboard-sdk`) — a single API key routes the review request to an open-weight model (e.g. Llama 3 via OpenRouter), so the mentor agent isn't locked to one model or one provider.
- **[ElevenLabs](https://elevenlabs.io)** — converts the written review into a spoken walkthrough so my mentee can listen to feedback away from her screen.
- **[Tinker](https://tinker-docs.thinkingmachines.ai)** (Thinking Machines) — fine-tunes a small open model (`Llama-3.1-8B-Instruct`, LoRA rank 16) on a corpus of my own past review comments in `finetune/review_examples.jsonl`, so the tone and priorities match how I actually mentor. `finetune/compare.py` samples the same prompt from the base model and the fine-tuned checkpoint side by side.

```
app/page.tsx              → landing page, sign in with Google/GitHub
app/auth/callback/        → Supabase OAuth code exchange
app/dashboard/page.tsx    → paste a mentee's code, get a review
app/api/review/route.ts   → calls Backboard (lib/backboard.ts)
app/api/voice/route.ts    → calls ElevenLabs (lib/elevenlabs.ts)
utils/supabase/           → browser/server/middleware Supabase clients
finetune/                 → Tinker scripts that give the reviewer my own voice
examples/                 → a sample mentee submission to try it on
```

## Why open innovation matters here

This only works because the model is open-weight:

- **I can fine-tune it on my own private review history.** No closed, hosted model lets an individual mentor do that without becoming an enterprise customer.
- **I'm not locked to one model or vendor.** Backboard lets me route the same request to whichever open model is cheapest or best that week.
- **It costs close to nothing to run**, so my mentee can ask for a review as often as she wants without anyone metering her.
- **Her code never has to sit on a server I don't control** beyond the inference call itself — there's no account, no dashboard logging her mistakes while she's still learning.

A closed API could generate *a* review. It couldn't be fine-tuned on my own comments, couldn't be routed between providers for cost, and would mean her learning curve runs through someone else's billing dashboard.

## Running it

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase, Backboard, ElevenLabs keys
npm run dev
```

Sign in at `/`, then paste code to review on `/dashboard`. Google/GitHub sign-in is configured as a provider inside your Supabase project (Authentication → Providers), not in this app's env vars — see the setup checklist in the post.

To give the reviewer your own mentoring voice:

```bash
cd finetune
pip install -r requirements.txt
export TINKER_API_KEY=...
python train.py
python compare.py <checkpoint-path-printed-by-train.py>
```

---

Built for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01).
