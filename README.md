# D4NCE

**Live demo: [d4ncedj.vercel.app](https://d4ncedj.vercel.app/)**

Two decks, a mixer, and a chat box. Load a couple of tracks and mix them yourself, or ask Grok or Claude to handle a transition.

You can use the included tracks or upload your own. The mixer has EQ, filters, reverb, delay, and flanger. Text and voice commands work too: “fade to deck B” or “drop the bass on A.”

## Showcase

![Planning a mix in chat](assets/showcase/ai-copilot.gif)

![A transition between decks](assets/showcase/ai-transition.gif)

## Quick Start

```bash
git clone https://github.com/Smokeybear10/001.CORE.d4nce.git
cd 001.CORE.d4nce
pnpm install
pnpm dev
```

Open http://localhost:2001. You can play tracks and use the mixer without any API keys.

For chat, add a provider key to `.env.local` and restart the server:

```env
XAI_API_KEY=your_xai_api_key
# Only needed if you select Claude:
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Grok is selected by default. Uploads save to `public/uploads` locally; on Vercel they use Blob storage and need `BLOB_READ_WRITE_TOKEN`.

## Tech Stack

The browser handles playback, mixing, and track analysis. For a transition, the model gets the track analysis and current mixer settings, then returns a plan. The audio engine follows that plan to move the crossfader and adjust EQ and effects.

| Layer | Tools |
|-------|-------|
| App | Next.js, React, TypeScript |
| UI | Tailwind CSS, Radix UI |
| Audio | Web Audio API |
| Visuals | Canvas 2D |
| Models | Grok and Claude through the Vercel AI SDK |
| Uploads | Local files or Vercel Blob |

The audio engine is in [`lib/music-engine.ts`](lib/music-engine.ts). Model selection is in [`lib/ai-model.ts`](lib/ai-model.ts), and the API routes are under [`app/api/grok`](app/api/grok).

Run `pnpm typecheck` and `pnpm build` to check changes.

Built by Thomas Ou
