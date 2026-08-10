"use client"

import { useState, useLayoutEffect, useRef } from "react"
import { DJ_HELP_STEPS } from "@/lib/dj-help-steps"

type DjHelpModalProps = {
  onClose: () => void
  onOpenCard: (cardId: string) => void
}

type GuideLayout = {
  rect: DOMRect | null
  top: number
  left: number
}

export function DjHelpModal({ onClose, onOpenCard }: DjHelpModalProps) {
  const [step, setStep] = useState(0)
  const [layout, setLayout] = useState<GuideLayout | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const current = DJ_HELP_STEPS[step]
  const isLast = step === DJ_HELP_STEPS.length - 1

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement
    dialog.showModal()

    return () => {
      dialog.close()
      if (previousFocus instanceof HTMLElement && previousFocus !== document.body) {
        previousFocus.focus()
      } else {
        document.querySelector<HTMLButtonElement>('[aria-label="Show help"]')?.focus()
      }
    }
  }, [])

  useLayoutEffect(() => {
    onOpenCard(current.target)
    const target = document.querySelector<HTMLElement>(`[data-card-id="${current.target}"]`)
      ?? document.querySelector<HTMLElement>(`[data-tour-id="${current.target}"]`)
    const card = cardRef.current
    if (!card) return
    card.scrollTop = 0
    card.querySelector<HTMLElement>("#dj-guide-title")?.focus({ preventScroll: true })

    const measure = () => {
      const rect = target?.getBoundingClientRect() ?? null
      const { width, height } = card.getBoundingClientRect()
      const margin = 12
      const gap = 12
      const maxTop = window.innerHeight - height - margin
      const maxLeft = window.innerWidth - width - margin
      let top = (window.innerHeight - height) / 2
      let left = (window.innerWidth - width) / 2

      if (rect) {
        if (rect.right + gap + width <= window.innerWidth - margin) {
          top = rect.top
          left = rect.right + gap
        } else if (rect.left - gap - width >= margin) {
          top = rect.top
          left = rect.left - gap - width
        } else if (rect.bottom + gap + height <= window.innerHeight - margin) {
          top = rect.bottom + gap
        } else if (rect.top - gap - height >= margin) {
          top = rect.top - gap - height
        } else {
          top = maxTop
        }
      }

      setLayout({
        rect,
        top: Math.max(margin, Math.min(top, maxTop)),
        left: Math.max(margin, Math.min(left, maxLeft)),
      })
    }

    let frame = requestAnimationFrame(measure)
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(scheduleMeasure)
    const positionObserver = new MutationObserver(scheduleMeasure)
    observer.observe(card)
    if (target) {
      observer.observe(target)
      positionObserver.observe(target, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleMeasure)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      positionObserver.disconnect()
      window.removeEventListener("resize", scheduleMeasure)
    }
  }, [current, onOpenCard])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dj-guide-title"
      aria-describedby="dj-guide-description"
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-violet-100 outline-none backdrop:bg-transparent"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
          const first = buttons[0]
          const last = buttons[buttons.length - 1]
          if (document.activeElement === (event.shiftKey ? first : last)) {
            event.preventDefault()
            ;(event.shiftKey ? last : first).focus()
          }
          return
        }
        if (event.key === "ArrowRight") {
          event.preventDefault()
          setStep(value => Math.min(value + 1, DJ_HELP_STEPS.length - 1))
        } else if (event.key === "ArrowLeft") {
          event.preventDefault()
          setStep(value => Math.max(value - 1, 0))
        }
      }}
    >
      {layout?.rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl border border-violet-200/45 shadow-[0_0_0_9999px_rgba(5,2,14,0.45)]"
          style={{
            top: layout.rect.top - 4,
            left: layout.rect.left - 4,
            width: layout.rect.width + 8,
            height: layout.rect.height + 8,
          }}
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[#05020e]/45" />
      )}

      <div
        ref={cardRef}
        data-guide-card
        className="fixed flex max-h-[calc(100dvh-24px)] w-[340px] max-w-[calc(100vw-24px)] flex-col overflow-y-auto rounded-[10px] border border-violet-200/25 bg-[linear-gradient(135deg,rgba(26,16,48,0.9),rgba(15,8,30,0.92))] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[14px]"
        style={layout
          ? { top: layout.top, left: layout.left }
          : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <span className="text-sm tabular-nums text-violet-200/65">{step + 1} of {DJ_HELP_STEPS.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -my-2 min-h-11 rounded-md px-2 text-sm text-violet-200/75 transition-colors hover:bg-white/5 hover:text-violet-100"
          >
            Skip guide
          </button>
        </div>

        <div aria-live="polite" aria-atomic="true">
          <h2 id="dj-guide-title" tabIndex={-1} className="mb-2 text-xl font-semibold leading-tight text-violet-50 outline-none">{current.title}</h2>
          <p id="dj-guide-description" className="text-base leading-relaxed text-violet-100/85">{current.desc}</p>
        </div>

        <div className="mt-5 flex shrink-0 items-center justify-between gap-3 border-t border-violet-200/15 pt-4">
          <button
            type="button"
            onClick={() => setStep(value => Math.max(value - 1, 0))}
            disabled={step === 0}
            className="min-h-11 rounded-md px-3 text-base font-medium text-violet-200/75 transition-colors hover:bg-white/5 hover:text-violet-100 disabled:cursor-default disabled:opacity-30"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => isLast ? onClose() : setStep(value => value + 1)}
            className="min-h-11 min-w-20 rounded-md border border-violet-200/30 bg-violet-300/20 px-4 text-base font-semibold text-violet-50 transition-colors hover:border-violet-200/45 hover:bg-violet-300/30 active:bg-violet-300/15"
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </dialog>
  )
}
