# Kahaani

Kahaani is a private, multilingual way for a family member to ask an elder one meaningful question and preserve the answer in the elder's own voice.

The product is deliberately split into two experiences in one Next.js app:

- **Host** (`/create`) creates and shares one private question.
- **Storyteller** (`/story/[shareToken]`) opens a link, hears or reads the question, records, and is done.

The original recording is the memory. Transcription and translation make it accessible across generations; they do not replace the person's voice.

## What is working

- English, Hindi, and Marathi storyteller experiences
- typed/preset English question translated for the storyteller, with generated prompt audio
- same-language **host voice question**: host records the question, Kahaani transcribes it, and the storyteller hears the host's real recording
- browser recording with upload to Convex File Storage
- background transcription and translations after audio is safely stored
- private keepsake page with original audio and transcript language switcher
- host memory shelf and deletion control
- privacy-conscious PostHog funnel analytics, with no names, question text, transcripts, tokens, URLs, or audio captured

## Architecture

Next.js serves the route experiences. The browser communicates primarily with Convex for invitations, storage uploads, memory state, and server-side AI calls. Sarvam is called only from Convex actions; `SARVAM_API_KEY` never reaches the browser.

```text
Next.js / browser  →  Convex queries, mutations, file upload URLs
                         ├─ Convex database + File Storage
                         └─ Convex actions → Sarvam STT / Translate / TTS
```

Read [Demo and engineering notes](docs/DEMO_BRIEF.md) for the complete flow, data model, architecture diagram, mentor Q&A, and known limits.

## Run locally

```bash
npm install
npx convex dev
npm run dev
```

Set the Sarvam key on the Convex deployment, never in a `NEXT_PUBLIC_*` variable:

```bash
npx convex env set SARVAM_API_KEY
```

Optional PostHog browser analytics uses these local variables:

```bash
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Copy the same variables into Vercel before deploying the frontend. Use `https://eu.i.posthog.com` instead if the PostHog project is in the EU region.

## Demo path

1. Open `/create`.
2. Enter `Suyash` and `Nani`, choose `हिन्दी`, then select a preset English question or record it in Hindi.
3. Share the private `/story/[shareToken]` link.
4. Nani hears/reads the Hindi question and records her answer.
5. Once upload succeeds, her original audio is safe. Processing continues in the background.
6. Open the host status link or `/memories`, then the final `/memory/[memoryToken]` page.

## Checks

```bash
npm run typecheck
npm run build
```
