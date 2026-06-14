# The Boardroom

A multi-modal AI advisory platform that simulates a personal board of directors.
Present a thought, problem, or idea and receive candid, character-consistent
advice from a curated board of AI personas.

This repository is the **Phase 1 foundation** — a fully runnable, text-first
vertical slice of the full [Master Build spec](#roadmap). It runs with **no
external credentials** (uses a localStorage store and a deterministic mock for
board responses), and lights up real Claude advice the moment you add an API key.

## Quick start

```bash
cd the-boardroom
npm install
cp .env.example .env.local   # optional — add ANTHROPIC_API_KEY for live advice
npm run dev                  # http://localhost:3000
```

Then:

1. **Build your board** — define a charter (purpose / values / goals), then pick
   from the 15 pre-built personas and/or add custom advisors.
2. **Present to the board** — type, speak (Web Speech API), or upload a `.txt`.
3. **Read the response** in three layouts: **Chat** (threaded, reply to any
   member), **Document** (board memo, export via print-to-PDF), or **Live ⭐**
   (round-table tiles — avatar/voice placeholders).

> Without `ANTHROPIC_API_KEY`, the board returns clearly-labeled demo responses
> so the entire flow is explorable offline. Add the key for real persona advice.

## What's implemented (Phase 1)

| Area | Status |
| --- | --- |
| Next.js 14 App Router + TypeScript + Tailwind, navy/gold design system | ✅ |
| 15 real-person personas with full persona prompts (`lib/ai/personas.ts`) | ✅ |
| Custom persona builder (attribute form → persona prompt) | ✅ |
| Board charter wizard (charter → composition → review → activate) | ✅ |
| Claude orchestrator: parallel per-member calls + board synthesis | ✅ |
| API routes `/api/session/respond`, `/api/session/synthesize` | ✅ |
| Chat, Document (PDF export), and Live (placeholder) layouts | ✅ |
| Voice input (Web Speech API) + `.txt` upload | ✅ |
| Supabase schema + RLS migration (`supabase/migrations/0001_init.sql`) | ✅ |
| localStorage persistence (Supabase-swappable) | ✅ |

## Architecture

```
app/                       Next.js routes (pages + API)
  api/session/respond      Orchestration endpoint (fan-out + synthesis)
  board/create             Charter wizard
  board/[boardId]/...      Dashboard, members, new session, session view
components/board|session   UI components (PersonaCard, BoardMemo, LiveBoardroom…)
lib/ai/                    personas, orchestrator, synthesis, customPersona
lib/store.ts               localStorage data layer (swap for Supabase)
lib/types.ts               Shared domain types
supabase/migrations/       Postgres schema + Row Level Security
```

The orchestrator (`lib/ai/orchestrator.ts`) follows the spec: it builds a system
prompt per member from their persona prompt + live board context, fans out to
parallel `claude-sonnet-4-6` calls (`ANTHROPIC_MODEL` to override), then makes a
second synthesis call in the voice of a board secretary. When no key is present
it returns deterministic mocks so nothing breaks.

## Stubbed seams (designed for the later phases)

These are intentionally left as clean integration points:

- **Supabase auth/persistence** — schema is ready; swap `lib/store.ts` for
  Supabase queries and add Google OAuth.
- **PDF/DOCX extraction** — upload currently handles `.txt`; wire `pdf-parse` /
  `mammoth` server-side for the rest.
- **ElevenLabs TTS** — `voiceId` fields exist on members; add `lib/voice`.
- **HeyGen / Tavus avatars** — `avatarId` fields + `MemberTile` placeholders are
  ready for streaming `<video>` in Live mode.
- **Stripe tiers** — `plan` field on users; gate features per the revenue model.

## Roadmap

- **Phase 1 (this)** — Foundation: personas, orchestration, text-first UI.
- **Phase 2** — Voice input (+Whisper fallback), PDF/DOCX extraction.
- **Phase 3** — ElevenLabs voice output, document export (react-pdf/puppeteer).
- **Phase 4** — Avatar boardroom (HeyGen/Tavus streaming, round-table turns).
- **Phase 5** — Stripe tiers, session archive, Supabase auth, landing page.

## Environment variables

See `.env.example`. Only `ANTHROPIC_API_KEY` is needed for live board advice;
everything else is optional until its phase.
