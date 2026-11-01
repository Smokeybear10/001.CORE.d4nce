export type DjHelpStep = {
  title: string
  desc: string
  target: string
}

export const DJ_HELP_STEPS: DjHelpStep[] = [
  {
    title: "Load two tracks",
    desc: "Pick a track in the library and press A. Pick another and press B. You can also upload your own audio.",
    target: "library",
  },
  {
    title: "Play a deck",
    desc: "Press play beside a track. Click its waveform to jump to another part of the song.",
    target: "transport",
  },
  {
    title: "Mix between them",
    desc: "Move the crossfader toward A or B to blend the tracks. Use EQ for bass, mids and highs, or open FX for effects.",
    target: "mixer",
  },
  {
    title: "Ask for a transition",
    desc: "Try “fade to deck B” in the chat, or use the microphone. You can keep mixing with the controls at any time.",
    target: "ai-copilot",
  },
]
