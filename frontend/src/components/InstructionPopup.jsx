import React, { useEffect } from 'react'
import { HiOutlineXMark } from 'react-icons/hi2'
import InstructionContent, { INSTR_BTN, INSTR_MUTED, INSTR_NAVY } from './InstructionContent'

/**
 * Full-screen overlay with the same instruction content as InstructionPage.
 * Dims the game behind it; closes on backdrop click, Escape, or Close.
 * Mount only when open (parent controls visibility).
 */
export default function InstructionPopup({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[55] flex items-start justify-center overflow-y-auto overflow-x-hidden overscroll-contain px-3 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 sm:pb-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instruction-popup-heading"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close instructions"
        onClick={onClose}
      />

      {/* Top-aligned (never vertically centered): avoids clipping when content is taller than the viewport */}
      <div
        className="relative z-10 mb-4 flex min-h-0 w-full max-w-6xl shrink-0 flex-col sm:mb-6"
        style={{ maxHeight: 'min(calc(100dvh - 4rem), calc(100vh - 4rem))' }}
      >
        <div
          className="flex min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-3xl border-2 shadow-2xl"
          style={{
            borderColor: INSTR_NAVY,
            background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 12%, #f5f8fc 100%)',
          }}
        >
          <div
            className="flex shrink-0 items-center justify-end gap-2 rounded-t-3xl border-b px-3 py-2.5 sm:px-4"
            style={{ borderColor: '#c5d9ef', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#1b2244] transition hover:bg-[#e8eef8]"
            >
              <HiOutlineXMark className="text-xl" aria-hidden />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2 sm:px-6 sm:pb-8 md:px-10">
            <InstructionContent headingId="instruction-popup-heading" compactLogo />

            <div className="mt-6 flex flex-col items-center border-t border-[#d9e2ef] pt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-2xl rounded-full py-3.5 px-8 text-base font-bold text-white shadow-[0_4px_20px_rgba(0,123,255,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:py-4 sm:text-lg"
                style={{ backgroundColor: INSTR_BTN }}
              >
                Back to game
              </button>
              <p className="mt-4 max-w-2xl text-center text-xs leading-relaxed sm:text-sm" style={{ color: INSTR_MUTED }}>
                Your progress is saved. Close anytime and open this panel again from the{' '}
                <span className="font-semibold" style={{ color: INSTR_NAVY }}>
                  ?
                </span>{' '}
                icon in the header.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
