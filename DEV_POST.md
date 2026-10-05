---
title: Mentor Me — an AI mentor that reviews her code the way I actually would
published: false
tags: devchallenge, weekendchallenge, hf26challenge, ai
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

Mentor Me — an AI mentor for a junior developer I informally mentor. She gets code review and "why would you do it this way" answers from me whenever I have a free minute, which is inconsistent and usually late at night. Mentor Me reviews her code on her own schedule, writes up what actually matters, and reads the feedback back to her as a short voice note — so she's never stuck waiting on me, and the feedback still sounds like mine, not a generic bot's.

## Demo

https://ashwintemkar.com/mentor-me

## Code

https://github.com/ashwintemkar/mentor-me

## How I Built It

- **Backboard** routes the review request through a single API key to an open-weight model, so the mentor agent isn't locked to one provider.
- **ElevenLabs** turns the written review into a spoken walkthrough she can listen to away from her screen.
- **Tinker** (Thinking Machines) fine-tunes a small open model with LoRA on a corpus of my own past review comments, so its feedback carries my actual tone and priorities instead of generic LLM notes. `finetune/compare.py` samples the base model and the fine-tuned checkpoint on the same prompt, side by side.

## Why Does Open Innovation Matter?

This only works because the model is open-weight. I can fine-tune it on my own private review history — no closed, hosted model lets an individual mentor do that without becoming an enterprise customer. Backboard means I'm not locked to one model or vendor, so I can route to whichever open model is cheapest or sharpest that week. And because it costs next to nothing to run, my mentee can ask for a review as often as she wants without anyone metering her, or her mistakes sitting on a server neither of us controls beyond the inference call itself.

## Prize Categories

- Best Use of Tinker (Thinking Machines)
- Best Use of Backboard
- Best Use of ElevenLabs
