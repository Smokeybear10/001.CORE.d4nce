"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type { Track } from "@/lib/types"
import { useTracks } from "@/hooks/use-tracks"
import { Upload, Search, Loader2, Sparkles, Trash2, Music } from "lucide-react"
import { cn } from "@/lib/utils"

interface MusicLibraryProps {
  onLoadToDeck: (track: Track, deck: "A" | "B") => void
  trackA?: Track | null
  trackB?: Track | null
}

export function MusicLibrary({ onLoadToDeck, trackA, trackB }: MusicLibraryProps) {
  const { tracks, isLoading, uploadTrack, deleteTrack, analyzeTrack } = useTracks()
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const checkScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 20)
  }, [])

  const filtered = tracks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.genre?.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    setUploadError(null)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) throw new Error(`"${file.name}" exceeds 50MB`)
        await uploadTrack(file)
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleAnalyze = async (track: Track) => {
    setAnalyzingId(track.id)
    try {
      await analyzeTrack(track)
    } catch {
      setFailedIds((prev) => new Set(prev).add(track.id))
    } finally {
      setAnalyzingId(null)
    }
  }

  useEffect(() => {
    const next = tracks.find((t) => !t.analyzed && !analyzingId && !failedIds.has(t.id))
    if (next) handleAnalyze(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, analyzingId, failedIds])

  // Check scroll state when tracks change
  useEffect(() => { checkScroll() }, [filtered.length, checkScroll])

  return (
    <div className="overflow-hidden flex flex-col h-full min-h-0">
      {/* Search + upload */}
      <div className="px-3 pt-3 pb-2.5 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-200/60" />
          <label htmlFor="library-search" className="sr-only">Search tracks</label>
          <input
            id="library-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks…"
            className="w-full h-10 pl-8 pr-3 rounded-md text-sm bg-violet-950/20 border border-violet-300/20 text-violet-50/90 placeholder:text-violet-200/65 focus:outline-none focus:border-violet-300/60 focus:ring-1 focus:ring-violet-300/25 transition-colors"
          />
        </div>
        <input ref={fileInputRef} type="file" accept=".mp3,.wav,.ogg,.m4a,.aac,.flac,audio/*" multiple className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-9 flex items-center justify-center gap-2 rounded-md border border-violet-300/20 bg-violet-500/[0.05] text-sm font-semibold text-violet-100/85 hover:text-violet-50 hover:bg-violet-500/10 transition-colors disabled:opacity-40"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload audio"}
        </button>
        {uploadError && <p role="alert" className="text-[11px] leading-relaxed text-red-300/90">{uploadError}</p>}
      </div>

      {/* Track list */}
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto relative" onScroll={checkScroll}>
        <div className="px-2 pb-2 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 aria-label="Loading tracks" className="h-4 w-4 animate-spin text-violet-200/70" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-1.5">
              <Music className="h-5 w-5 text-violet-200/50" />
              <p className="text-[12px] text-violet-200/75">{search ? "No matching tracks" : "Upload audio to get started"}</p>
            </div>
          ) : (
            filtered.map((track) => {
              const onA = trackA?.id === track.id
              const onB = trackB?.id === track.id
              return (
                <div key={track.id} className={cn(
                  "group relative px-2 py-2.5 rounded-md transition-colors cursor-default",
                  onA ? "bg-amber-500/[0.08] border-l-2 border-l-amber-400/65" :
                  onB ? "bg-cyan-500/[0.08] border-l-2 border-l-cyan-400/65" :
                  "hover:bg-violet-500/[0.08] border-l-2 border-l-transparent",
                )}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={cn(
                          "text-sm font-semibold truncate leading-snug",
                          onA ? "text-amber-100/90" : onB ? "text-cyan-100/90" : "text-violet-50/85",
                        )} title={track.title}>{track.title}</p>
                        {onA && <span className="shrink-0 text-[11px] font-mono text-amber-300/90">A</span>}
                        {onB && <span className="shrink-0 text-[11px] font-mono text-cyan-300/90">B</span>}
                      </div>
                      <p className="text-[11px] font-mono text-violet-200/75 mt-1 truncate">
                        {track.bpm ? `${Math.round(track.bpm)} BPM` : ""}
                        {track.bpm && track.key ? " · " : ""}
                        {track.key ?? ""}
                        {!track.bpm && !track.key ? (
                          analyzingId === track.id ? (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 aria-label="Analyzing track" className="h-3 w-3 animate-spin inline" />
                            </span>
                          ) : "—"
                        ) : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 shrink-0">
                      <button
                        onClick={() => onLoadToDeck(track, "A")}
                        aria-label={`Load ${track.title} to deck A`}
                        aria-pressed={onA}
                        title={onA ? "Loaded in deck A" : "Load to deck A"}
                        className={cn("h-8 w-8 rounded-md border text-xs font-mono transition-colors max-sm:h-11 max-sm:w-11", onA ? "border-amber-300/50 bg-amber-400/15 text-amber-200" : "border-amber-300/25 text-amber-200/90 hover:bg-amber-400/10 hover:border-amber-300/50")}
                      >A</button>
                      <button
                        onClick={() => onLoadToDeck(track, "B")}
                        aria-label={`Load ${track.title} to deck B`}
                        aria-pressed={onB}
                        title={onB ? "Loaded in deck B" : "Load to deck B"}
                        className={cn("h-8 w-8 rounded-md border text-xs font-mono transition-colors max-sm:h-11 max-sm:w-11", onB ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-200" : "border-cyan-300/25 text-cyan-200/90 hover:bg-cyan-400/10 hover:border-cyan-300/50")}
                      >B</button>
                      <button
                        onClick={() => handleAnalyze(track)}
                        disabled={analyzingId === track.id}
                        aria-label={`Analyze ${track.title}`}
                        title="Analyze track"
                        className="w-8 h-7 rounded flex items-center justify-center text-violet-200/55 hover:text-violet-100 hover:bg-violet-500/10 transition-colors disabled:opacity-40 max-sm:w-11"
                      >
                        {analyzingId === track.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => deleteTrack(track.id, track.url)}
                        aria-label={`Delete ${track.title}`}
                        title="Delete track"
                        className="w-8 h-7 rounded flex items-center justify-center text-violet-200/55 hover:text-red-300 hover:bg-red-400/10 transition-colors max-sm:w-11"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {/* Scroll indicator */}
        {canScrollDown && (
          <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#110328] to-transparent pointer-events-none flex items-end justify-center pb-1">
            <span className="text-[11px] text-violet-200/65">More tracks below</span>
          </div>
        )}
      </div>
    </div>
  )
}
