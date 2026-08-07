"use client"

import type { MusicObject } from "@/lib/types"
import { Disc3, Sparkles, HelpCircle, Library, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type TopBarProps = {
  musicObject: MusicObject
  onModeChange: (mode: MusicObject["visualizerMode"]) => void
  onColorSchemeChange: (scheme: MusicObject["colorScheme"]) => void
  aiOpen: boolean
  onToggleAI: () => void
  libraryOpen: boolean
  onToggleLibrary: () => void
  mixerOpen: boolean
  onToggleMixer: () => void
  onShowHelp: () => void
}

export function TopBar({
  aiOpen,
  onToggleAI,
  libraryOpen,
  onToggleLibrary,
  mixerOpen,
  onToggleMixer,
  onShowHelp,
}: TopBarProps) {
  return (
    <header className="absolute top-0 inset-x-0 z-30 flex h-[calc(56px+env(safe-area-inset-top))] items-center justify-between gap-2 border-b border-violet-200/15 bg-[#100923]/85 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-4">
      <div className="flex items-center gap-2.5">
        <Disc3 className="hidden h-6 w-6 shrink-0 text-fuchsia-300 sm:block" strokeWidth={1.5} />
        <div className="flex flex-col leading-none text-left">
          <span
            className="font-[family-name:var(--font-orbitron)] text-[15px] font-semibold tracking-[0.16em] text-violet-100 sm:text-base"
          >
            D4NCE
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-violet-200/70">by Thomas Ou</span>
        </div>
      </div>

      <nav aria-label="DJ panels" className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMixer}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 transition-colors sm:px-3",
            mixerOpen
              ? "bg-violet-300/15 text-violet-100"
              : "text-violet-200/75 hover:bg-white/5 hover:text-violet-100",
          )}
          aria-label="Toggle mixer"
          aria-pressed={mixerOpen}
          title="Mixer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden text-sm font-semibold sm:inline">Mixer</span>
        </button>
        <button
          type="button"
          onClick={onToggleLibrary}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 transition-colors sm:px-3",
            libraryOpen
              ? "bg-violet-300/15 text-violet-100"
              : "text-violet-200/75 hover:bg-white/5 hover:text-violet-100",
          )}
          aria-label="Toggle library"
          aria-pressed={libraryOpen}
          title="Library"
        >
          <Library className="h-4 w-4" />
          <span className="hidden text-sm font-semibold sm:inline">Library</span>
        </button>
        <button
          type="button"
          onClick={onToggleAI}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 transition-colors sm:px-3",
            aiOpen
              ? "bg-violet-300/15 text-violet-100"
              : "text-violet-200/75 hover:bg-white/5 hover:text-violet-100",
          )}
          aria-label="Toggle AI copilot"
          aria-pressed={aiOpen}
          title="AI Copilot"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden text-sm font-semibold sm:inline">AI copilot</span>
        </button>
        <button
          type="button"
          onClick={onShowHelp}
          className="flex h-11 w-11 items-center justify-center rounded-md text-violet-200/75 transition-colors hover:bg-white/5 hover:text-violet-100"
          aria-label="Show help"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </nav>
    </header>
  )
}
