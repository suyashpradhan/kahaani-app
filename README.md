# Kahaani

Private, multilingual family memories for the Build for India hackathon.

## Run locally

```bash
npm install
npx convex dev
npm run dev
```

The first Convex run creates `.env.local`. Add your Sarvam key to the Convex deployment only:

```bash
npx convex env set SARVAM_API_KEY
```

Use `NEXT_PUBLIC_APP_URL` for the deployed application origin. P0 supports English (`en-IN`), Hindi (`hi-IN`), and Marathi (`mr-IN`).

## Demo flow

1. Open `/create`, use Suyash → Nani → हिन्दी, and choose the childhood-home question.
2. Record the question or use Kahaani’s generated prompt voice.
3. Share the generated `/story/[token]` link.
4. Record Ajji’s answer in Chrome/Android Chrome.
5. Once original audio reaches Convex, background transcription and translations run without blocking the storyteller’s success state.
6. Open `/memory/[memoryToken]` after processing to hear the original recording and read the original or translated transcript.

## Checks

```bash
npm run typecheck
npm run build
```
