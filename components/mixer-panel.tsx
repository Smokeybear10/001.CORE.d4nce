"use client"

import { useState } from "react"
import type { MusicObject } from "@/lib/types"
import type { TransitionState } from "@/lib/music-engine"
import { Slider } from "@/components/ui/slider"
import { Shuffle, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MixerPanelProps {
  musicObject: MusicObject
  transitionState: TransitionState
  bpmA: number | null
  bpmB: number | null
  camelotA?: string | null
  camelotB?: string | null
  keyCompatibility?: number | null
  onCrossfadeChange: (value: number) => void
  onEQChange: (band: "low" | "mid" | "high", value: number) => void
  onFilterChange: (cutoff: number) => void
  onReverbChange: (value: number) => void
  onDelayChange: (value: number) => void
  onMasterGainChange: (value: number) => void
  onIsolationChange: (deck: "A" | "B", type: "bass" | "voice" | "melody", value: number) => void
  onFXChange: (param: string, value: number) => void
  onPerDeckEQChange: (deck: "A" | "B", band: "low" | "mid" | "high", value: number) => void
  onTransition: () => void
  onCancelTransition: () => void
  trackALoaded: boolean
  trackBLoaded: boolean
}

type MixerTab = "eq" | "fx" | "iso" | "deck"

function Label({ children, color }: { children: React.ReactNode; color?: "a" | "b" }) {
  return (
    <span className={cn(
      "text-xs font-mono uppercase tracking-[0.06em]",
      color === "a" ? "text-amber-200/85" : color === "b" ? "text-cyan-200/85" : "text-violet-100/75",
    )}>
      {children}
    </span>
  )
}

function Val({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={cn(
      "text-xs font-mono tabular-nums",
      active ? "text-violet-50" : "text-violet-200/70",
    )}>
      {children}
    </span>
  )
}

export function MixerPanel({
  musicObject, transitionState,
  bpmA, bpmB, camelotA, camelotB,
  onCrossfadeChange, onEQChange, onFilterChange,
  onReverbChange, onDelayChange, onMasterGainChange,
  onIsolationChange, onFXChange, onPerDeckEQChange,
  onTransition, onCancelTransition,
  trackALoaded, trackBLoaded,
}: MixerPanelProps) {
  const [tab, setTab] = useState<MixerTab>("eq")
  const crossfader = musicObject.crossfader ?? 0.5

  const tabs: { id: MixerTab; label: string }[] = [
    { id: "eq", label: "EQ" },
    { id: "fx", label: "FX" },
    { id: "iso", label: "ISO" },
    { id: "deck", label: "A|B" },
  ]

  return (
    <div className={cn(
      "flex h-full min-h-0 flex-col [&_[data-slot=slider]]:cursor-pointer",
      "[@media(max-height:540px)]:overflow-y-auto [@media(max-height:540px)]:overscroll-contain",
      "[&_[data-slot=slider][data-orientation=horizontal]]:min-h-8 [&_[data-slot=slider][data-orientation=vertical]]:min-w-8",
      "[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-violet-300/65",
      "[&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:bg-violet-100",
      "[&_[data-slot=slider-thumb]:focus-visible]:outline-2 [&_[data-slot=slider-thumb]:focus-visible]:outline-offset-4 [&_[data-slot=slider-thumb]:focus-visible]:outline-violet-200",
    )}>
      {/* BPM */}
      <div className="flex shrink-0 items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-mono text-amber-200/90 tabular-nums">{bpmA ?? "—"}</span>
          {camelotA && <span className="text-[11px] font-mono text-amber-200/70">{camelotA}</span>}
        </div>
        <div className="flex items-center gap-2">
          {camelotB && <span className="text-[11px] font-mono text-cyan-200/70">{camelotB}</span>}
          <span className="text-[13px] font-mono text-cyan-200/90 tabular-nums">{bpmB ?? "—"}</span>
        </div>
      </div>

      {/* Crossfader */}
      <div className="shrink-0 px-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-200/85">A</span>
          <Slider value={[crossfader * 100]} onValueChange={([v]) => onCrossfadeChange(v / 100)} max={100} step={1} className="flex-1" />
          <span className="text-xs font-mono text-cyan-200/85">B</span>
        </div>
      </div>

      {/* Transition */}
      <div className="shrink-0 px-3 pb-3">
        {transitionState.isActive ? (
          <button
            type="button"
            onClick={onCancelTransition}
            aria-label="Cancel transition"
            className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-red-300/30 bg-red-300/[0.06] px-2 py-2 text-[11px] font-mono uppercase tracking-[0.06em] text-red-200 transition-colors hover:bg-red-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
          >
            Cancel · {Math.round(transitionState.progress * 100)}%
          </button>
        ) : (
          <button
            type="button"
            onClick={onTransition}
            disabled={!trackALoaded || !trackBLoaded}
            className={cn(
              "flex min-h-9 w-full items-center justify-center gap-2 rounded-md border px-2 py-2 text-[11px] font-mono uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200",
              trackALoaded && trackBLoaded
                ? "text-violet-100 bg-violet-300/10 border-violet-300/30 hover:bg-violet-300/15 hover:border-violet-300/50"
                : "text-violet-200/45 border-white/10",
            )}
          >
            <Shuffle className="h-3.5 w-3.5" />
            Transition
          </button>
        )}
      </div>

      <div className="mx-3 h-px shrink-0 bg-white/10" />

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 px-3 py-2">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "min-h-9 flex-1 rounded-md py-2 text-[11px] font-mono uppercase tracking-[0.06em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200",
              tab === id ? "text-violet-50 bg-violet-300/15" : "text-violet-200/65 hover:text-violet-100 hover:bg-white/5",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-1 pb-3 space-y-3 [@media(max-height:540px)]:flex-none [@media(max-height:540px)]:overflow-visible">
        {tab === "eq" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {(["high", "mid", "low"] as const).map((band) => {
                const v = musicObject.eq?.[band] ?? 0
                return (
                  <div key={band} className="flex flex-col items-center gap-1">
                    <Label>{band}</Label>
                    <div className="h-20 flex items-center">
                      <Slider orientation="vertical" value={[v + 12]} onValueChange={([n]) => onEQChange(band, n - 12)} max={24} step={0.5} className="h-full !min-h-0" />
                    </div>
                    <Val active={v !== 0}>{v > 0 ? "+" : ""}{v.toFixed(0)}</Val>
                  </div>
                )
              })}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>Filter</Label>
                <Val active={(musicObject.filter?.cutoff ?? 20000) < 19000}>{(musicObject.filter?.cutoff ?? 20000) >= 1000 ? `${((musicObject.filter?.cutoff ?? 20000) / 1000).toFixed(1)}k` : (musicObject.filter?.cutoff ?? 20000).toFixed(0)} Hz</Val>
              </div>
              <Slider value={[(Math.log10(musicObject.filter?.cutoff ?? 20000) / Math.log10(20000)) * 100]} onValueChange={([v]) => onFilterChange(Math.pow(10, (v / 100) * Math.log10(20000)))} max={100} step={1} />
            </div>
          </>
        )}

        {tab === "fx" && (
          <>
            {([
              { label: "Reverb", value: musicObject.reverbAmount ?? 0, onChange: onReverbChange },
              { label: "Delay", value: musicObject.delayAmount ?? 0, onChange: onDelayChange },
            ]).map(({ label, value, onChange }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label>{label}</Label>
                  <Val active={value > 0}>{Math.round(value * 100)}%</Val>
                </div>
                <Slider value={[value * 100]} onValueChange={([v]) => onChange(v / 100)} max={100} step={1} />
              </div>
            ))}
            {onFXChange && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label>Flanger</Label>
                    <Val active={(musicObject.fx?.flangerMix ?? 0) > 0}>{Math.round((musicObject.fx?.flangerMix ?? 0) * 100)}%</Val>
                  </div>
                  <Slider value={[(musicObject.fx?.flangerMix ?? 0) * 100]} onValueChange={([v]) => onFXChange("flangerMix", v / 100)} max={100} step={1} />
                </div>
                {(musicObject.fx?.flangerMix ?? 0) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label>Rate</Label>
                      <Val>{(musicObject.fx?.flangerRate ?? 0.25).toFixed(2)} Hz</Val>
                    </div>
                    <Slider value={[(musicObject.fx?.flangerRate ?? 0.25) * 200]} onValueChange={([v]) => onFXChange("flangerRate", v / 200)} max={100} step={1} />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "iso" && (
          <>
            {(["bass", "voice", "melody"] as const).map((type) => (
              <div key={type} className="space-y-1">
                <Label>{type}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B"] as const).map((d) => (
                    <div key={d} className="space-y-0.5">
                      <span className={cn("text-xs font-mono", d === "A" ? "text-amber-200/85" : "text-cyan-200/85")}>{d}</span>
                      <Slider
                        value={[((musicObject.tracks?.[d] as Record<string, number> | null)?.[`${type}Isolation`] ?? 0) * 100]}
                        onValueChange={([v]) => onIsolationChange(d, type, v / 100)}
                        max={100} step={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "deck" && (
          <>
            {(["A", "B"] as const).map((d) => {
              const deckColor = d === "A" ? "a" as const : "b" as const
              return (
                <div key={d} className="space-y-2">
                  <span className={cn("text-xs font-mono font-medium", d === "A" ? "text-amber-200/85" : "text-cyan-200/85")}>Deck {d}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "mid", "high"] as const).map((band) => {
                      const v = musicObject.perDeckEq?.[d]?.[band] ?? 0
                      return (
                        <div key={band} className="flex flex-col items-center gap-0.5">
                          <Label color={deckColor}>{band}</Label>
                          <div className="h-16 flex items-center">
                            <Slider orientation="vertical" value={[v + 12]} onValueChange={([n]) => onPerDeckEQChange(d, band, n - 12)} max={24} step={0.5} className="h-full !min-h-0" />
                          </div>
                          <Val active={v !== 0}>{v > 0 ? "+" : ""}{v.toFixed(0)}</Val>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Master */}
        <div className="space-y-1 border-t border-white/10 pt-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5 text-violet-200/70" />
              <Label>Master</Label>
            </div>
            <Val active>{Math.round((musicObject.masterGain ?? 0.8) * 100)}%</Val>
          </div>
          <Slider value={[(musicObject.masterGain ?? 0.8) * 100]} onValueChange={([v]) => onMasterGainChange(v / 100)} max={100} step={1} />
        </div>
      </div>
    </div>
  )
}
