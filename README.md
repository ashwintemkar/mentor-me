# Mentor Me 🧑‍🏫

A two-sided mentorship platform: anyone can mentor, anyone can be mentored, and often both at once. Connect by username, get structured AI-guided feedback on real code — strengths, specific things to fix and why, concrete next steps — and watch recurring patterns surface as a mentee grows.

**Live:** https://mentor-me.ashwintemkar.com
**Repo:** https://github.com/ashwintemkar/mentor-me

## The idea

I informally mentor a junior developer, and I've also wanted a mentor myself for things I'm still learning. Most "code review" tools assume one fixed direction. Mentor Me doesn't: sign up, get a unique username, and either invite someone to be your mentee or request someone to be your mentor. Once they accept, code submitted in that connection gets reviewed like an actual mentor would — not a linter dump, but a structured breakdown with *why* something matters and *what to work on next* — and a growth summary tracks what keeps coming up across every review in that relationship.

## How it's built

A Next.js (TypeScript, App Router) web app:

- **[Supabase](https://supabase.com)** — Auth (Google/GitHub sign-in) and Postgres for `profiles`, `connections`, and `reviews`, with row-level security scoping every row to the people actually in that relationship.
- **[Backboard](https://backboard.io)** (`backboard-sdk`) — a single API key routes the review request to an open-weight model (Llama 3.3 70B via OpenRouter), returning structured JSON (strengths / improvements / next steps), not a wall of text.
- **[Tinker](https://tinker-docs.thinkingmachines.ai)** (Thinking Machines) — fine-tunes a small open model (`Llama-3.1-8B-Instruct`, LoRA rank 16) on a mentor's own past review comments in `finetune/review_examples.jsonl`, so feedback carries their actual tone. `finetune/compare.py` samples the base model and the fine-tuned checkpoint side by side.
- **[Render](https://render.com)** — hosts the app itself (`render.yaml` blueprint included).

```
app/page.tsx                          → landing page, sign in
app/dashboard/page.tsx                → your connections: mentoring, being mentored, pending
app/dashboard/[id]/page.tsx           → one connection: growth summary, review form, history
app/api/connections/                  → create/list connections, accept/decline invites
app/api/connections/[id]/reviews/     → submit code, get a structured review via Backboard
app/api/users/search/                 → look someone up by username to invite/request
lib/profiles.ts                       → username assignment + lookup
lib/connections.ts                    → connection + review data access
lib/backboard.ts                      → Backboard call, structured-JSON prompt + parsing
utils/supabase/                       → browser/server/middleware Supabase clients
supabase/schema.sql                   → profiles/connections/reviews tables + RLS policies
finetune/                             → Tinker scripts for a mentor's own voice
render.yaml                           → Render Blueprint for one-click deployment
```

## Why open innovation matters here

This only works because the model is open-weight:

- **A mentor can fine-tune it on their own private review history.** No closed, hosted model lets an individual do that without becoming an enterprise customer.
- **Not locked to one model or vendor.** Backboard routes to whichever open model is cheapest or best that week.
- **Costs close to nothing to run**, so anyone in a connection can ask for a review as often as they want without anyone metering them.
- **Code never has to sit on a server neither party controls** beyond the inference call itself, and row-level security means even other users of the same app can't see it.

## Running it

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase and Backboard keys
npm run dev
```

Run `supabase/schema.sql` once in your Supabase project's SQL Editor before first use. Sign in at `/`, you'll get a username automatically, then invite or request someone from `/dashboard`.

To give a mentor's reviews their own voice:

```bash
cd finetune
pip install -r requirements.txt
export TINKER_API_KEY=...
python train.py
python compare.py <checkpoint-path-printed-by-train.py>
```

## Deploying on Render

1. [render.com](https://render.com) → sign in with GitHub → **New → Blueprint** → pick `ashwintemkar/mentor-me`. Render reads `render.yaml` and sets up the web service.
2. Fill in the env vars it prompts for (same list as `.env.local.example`).
3. Deploy. Render gives you a `*.onrender.com` URL; add a custom domain under the service's **Settings → Custom Domains** and point a CNAME at the target it gives you.

---

Built for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01).
