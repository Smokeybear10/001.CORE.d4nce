"use client"

import { useMemo } from "react"
import type { Track, MusicObject, WaveformPeak, CuePoint, LoopRegion } from "@/lib/types"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

type TransportBarProps = {
  trackA: Track | null
  trackB: Track | null
  musicObject: MusicObject
  isPlayingA: boolean
  isPlayingB: boolean
  currentTimeA: number
  currentTimeB: number
  durationA: number
  durationB: number
  bpmA?: number | null
  bpmB?: number | null
  camelotKeyA?: string | null
  camelotKeyB?: string | null
  waveformPeaksA?: WaveformPeak[] | null
  waveformPeaksB?: WaveformPeak[] | null
  cuePointsA?: CuePoint[]
  cuePointsB?: CuePoint[]
  loopA?: LoopRegion | null
  loopB?: LoopRegion | null
  onPlay: (deck?: "A" | "B") => void
  onPause: (deck?: "A" | "B") => void
  onSeek: (deck: "A" | "B", time: number) => void
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, "0")}`
}

function InlineWaveform({
  deck, track, isPlaying, currentTime, duration,
  bpm, camelotKey, waveformPeaks, cuePoints, loop,
  onPlay, onPause, onSeek,
}: {
  deck: "A" | "B"
  track: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  bpm?: number | null
  camelotKey?: string | null
  waveformPeaks?: WaveformPeak[] | null
  cuePoints?: CuePoint[]
  loop?: LoopRegion | null
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const isA = deck === "A"
  const remaining = duration > 0 ? duration - currentTime : 0

  const bars = waveformPeaks?.length || 200
  const barData = useMemo(() => {
    if (!waveformPeaks?.length) {
      return Array.from({ length: 200 }, (_, i) => ({
        h: 2 + ((((i * 47 + 13) % 29) * 7 + ((i * 73 + 7) % 19) * 3) / 29),
      }))
    }
    return waveformPeaks.map(p => ({
      h: Math.max(1, p.rms * 30 + Math.abs(p.max - p.min) * 10),
    }))
  }, [waveformPeaks])

  const loopStartPct = loop && duration > 0 ? (loop.startTime / duration) * 100 : null
  const loopEndPct = loop && duration > 0 ? (loop.endTime / duration) * 100 : null

  const playedColor = isA ? "rgba(251,191,36," : "rgba(1,205,254,"
  const unplayedColor = "rgba(185,103,255,"

  return (
    <div className={cn(
      "group relative flex-1 min-w-0 h-[72px] rounded-lg overflow-hidden transition-colors",
      "bg-[#140b2b]/85 border border-violet-200/15",
      isPlaying && (isA
        ? "border-amber-300/40"
        : "border-cyan-300/40"
      ),
    )}>
      {/* Top info row */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 pl-3 pr-14 pt-1.5 pointer-events-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn(
            "shrink-0 text-xs font-mono font-semibold",
            isA ? "text-amber-200" : "text-cyan-200",
          )}>{deck}</span>
          {track && (
            <span className="truncate text-sm font-semibold text-violet-100">{track.title}</span>
          )}
        </div>
        <div className="hidden items-center gap-2 shrink-0 sm:flex">
          {bpm && <span className="text-[11px] font-mono text-violet-200/80 tabular-nums">{Math.round(bpm)} BPM</span>}
          {camelotKey && <span className="text-[11px] font-mono text-violet-200/80">{camelotKey}</span>}
        </div>
      </div>

      {/* Empty state */}
      {!track && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="text-sm font-medium text-violet-200/80">Load a track</span>
        </div>
      )}

      {/* Waveform SVG */}
      <div
        className={cn("absolute inset-y-5 left-2 right-14 rounded-sm", !track && "right-2")}
        role="slider"
        aria-label={`Seek deck ${deck}`}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        aria-disabled={!duration}
        tabIndex={duration ? 0 : -1}
        onKeyDown={(e) => {
          if (!duration) return
          const target = e.key === "ArrowRight" || e.key === "ArrowUp" ? currentTime + 5
            : e.key === "ArrowLeft" || e.key === "ArrowDown" ? currentTime - 5
            : e.key === "Home" ? 0 : e.key === "End" ? duration : null
          if (target === null) return
          e.preventDefault()
          onSeek(Math.max(0, Math.min(duration, target)))
        }}
        onClick={(e) => {
          if (!duration) return
          const rect = e.currentTarget.getBoundingClientRect()
          onSeek(((e.clientX - rect.left) / rect.width) * duration)
        }}
      >
        <svg viewBox={`0 0 ${bars} 28`} className="w-full h-full" preserveAspectRatio="none">
          {loopStartPct !== null && loopEndPct !== null && loop?.active && (
            <rect
              x={(loopStartPct / 100) * bars} y={0}
              width={((loopEndPct - loopStartPct) / 100) * bars} height={28}
              fill="rgba(185,103,255,0.05)"
            />
          )}

          {barData.map((bar, i) => {
            const played = (i / bars) * 100 < progress
            const h = Math.min(12, bar.h)
            const color = played ? playedColor : unplayedColor
            const opacity = played ? 0.8 : track ? 0.28 : 0.08
            return (
              <g key={i}>
                <rect x={i} y={14 - h} width={0.7} height={h} fill={`${color}${opacity})`} />
                <rect x={i} y={14} width={0.7} height={h * 0.3} fill={`${color}${opacity * 0.35})`} />
              </g>
            )
          })}

          {cuePoints?.map(cue => {
            const x = duration > 0 ? (cue.time / duration) * bars : 0
            return (
              <line key={cue.id} x1={x} y1={0} x2={x} y2={28}
                stroke={isA ? "rgba(251,191,36,0.35)" : "rgba(1,205,254,0.35)"} strokeWidth={0.4}
              />
            )
          })}

          {progress > 0 && (
            <rect
              x={Math.max(0, (progress / 100) * bars - 0.25)}
              y={0} width={0.4} height={28}
              fill="rgba(255,255,255,0.6)"
            />
          )}
        </svg>
      </div>

      {/* Time overlay */}
      <div className={cn("absolute inset-x-0 bottom-0 z-10 flex items-center justify-between pl-3 pb-1 pointer-events-none", track ? "pr-14" : "pr-3")}>
        <span className="text-[11px] font-mono text-violet-200/80 tabular-nums">{formatTime(currentTime)}</span>
        <span className="text-[11px] font-mono text-violet-200/80 tabular-nums">-{formatTime(remaining)}</span>
      </div>

      {/* Play/pause */}
      {track && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); isPlaying ? onPause() : onPlay() }}
          aria-label={isPlaying ? `Pause deck ${deck}` : `Play deck ${deck}`}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-md border transition-colors",
            isA ? "border-amber-200/20 bg-amber-200/10 text-amber-200 hover:bg-amber-200/20" : "border-cyan-200/20 bg-cyan-200/10 text-cyan-200 hover:bg-cyan-200/20",
          )}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
      )}
    </div>
  )
}

export function TransportBar({
  trackA, trackB, musicObject,
  isPlayingA, isPlayingB,
  currentTimeA, currentTimeB,
  durationA, durationB,
  bpmA, bpmB,
  camelotKeyA, camelotKeyB,
  waveformPeaksA, waveformPeaksB,
  cuePointsA, cuePointsB,
  loopA, loopB,
  onPlay, onPause, onSeek,
}: TransportBarProps) {

  return (
    <div className="absolute top-[calc(56px+env(safe-area-inset-top))] inset-x-0 z-25" data-tour-id="transport">
      <div>
        {/* Waveform strips */}
        <div className="flex gap-2 px-3 py-2 sm:px-4">
          <InlineWaveform
            deck="A" track={trackA} isPlaying={isPlayingA}
            currentTime={currentTimeA} duration={durationA}
            bpm={bpmA} camelotKey={camelotKeyA}
            waveformPeaks={waveformPeaksA} cuePoints={cuePointsA} loop={loopA}
            onPlay={() => onPlay("A")} onPause={() => onPause("A")}
            onSeek={(t) => onSeek("A", t)}
          />
          <InlineWaveform
            deck="B" track={trackB} isPlaying={isPlayingB}
            currentTime={currentTimeB} duration={durationB}
            bpm={bpmB} camelotKey={camelotKeyB}
            waveformPeaks={waveformPeaksB} cuePoints={cuePointsB} loop={loopB}
            onPlay={() => onPlay("B")} onPause={() => onPause("B")}
            onSeek={(t) => onSeek("B", t)}
          />
        </div>
      </div>
    </div>
  )
}
