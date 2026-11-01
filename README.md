# D4NCE | Browser DJ

**Live demo: [d4ncedj.vercel.app](https://d4ncedj.vercel.app/)**

A browser-based DJ app with two decks, a mixer, and an AI copilot for planning transitions.

## Showcase

**Copilot**

Use text or voice to load tracks, adjust the mixer, and plan a transition.

![D4NCE copilot planning a mix](assets/showcase/ai-copilot.gif)

**Transitions**

The engine runs crossfader, EQ, filter, and effect automation between decks.

![D4NCE mixing between two tracks](assets/showcase/ai-transition.gif)

## Quick Start

```bash
git clone https://github.com/Smokeybear10/001.CORE.d4nce.git
cd 001.CORE.d4nce
pnpm install
```

For the copilot, create `.env.local` with the key for your chosen provider. Grok is the default; Claude is selectable in the chat panel.

```env
XAI_API_KEY=your_xai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Manual mixing and the demo tracks work without AI keys. Uploads save locally during development; uploads on Vercel require `BLOB_READ_WRITE_TOKEN`.

```bash
pnpm dev
```

Open http://localhost:2001.

## What It Does

**Mixing**

- Two decks with waveforms, playback controls, tempo adjustment, and a crossfader.
- Per-deck EQ, filters, reverb, delay, and flanger.
- A track library with uploads and built-in demo tracks.

**Copilot**

- Text and voice commands using Grok or Claude.
- Transition plans with timed changes to the mixer.
- Track recommendations based on tempo, key, and energy.

**Workspace**

- Draggable mixer, library, and copilot panels.
- An audio-reactive background drawn with Canvas 2D.

## How Transitions Work

Tracks are analyzed in the browser for tempo, key, waveform, and song structure. The copilot receives that analysis alongside the current deck and mixer state, then returns a transition plan. The audio engine applies the plan over time; playback and mixing run locally through the Web Audio API.

## Tech Stack

| Layer | Tools |
|-------|-------|
| App | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS, Radix UI |
| Audio | Web Audio API |
| Visuals | Canvas 2D |
| AI | Vercel AI SDK, xAI, Anthropic |
| Uploads | Local filesystem in development, Vercel Blob in production |

## Project Structure

```text
app/page.tsx          # DJ workspace
app/api/grok/         # Copilot, analysis, and transition endpoints
app/api/tracks/       # Track library and uploads
components/           # Mixer, library, copilot, and visualizer
hooks/                # Audio lifecycle, tracks, and voice input
lib/music-engine.ts   # Audio graph and transition execution
lib/ai-model.ts       # Provider and model selection
```

Run `pnpm typecheck` and `pnpm build` to check changes.

---

Built by Thomas Ou
