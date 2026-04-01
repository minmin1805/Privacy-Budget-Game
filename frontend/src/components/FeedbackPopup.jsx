import React from 'react'
import { FaCheckCircle, FaInfoCircle, FaLightbulb } from 'react-icons/fa'

function FeedbackChip({ icon, text, tone = 'success' }) {
  const styles =
    tone === 'success'
      ? 'bg-[#ecf8e8] border-[#5f8d57] text-[#243553]'
      : 'bg-[#fff2de] border-[#8f7a58] text-[#243553]'

  return (
    <div className={`rounded-md border px-3 py-2.5 text-sm md:text-base flex items-start gap-2 ${styles}`}>
      <span className='mt-0.5 shrink-0'>{icon}</span>
      <span className='leading-snug'>{text}</span>
    </div>
  )
}

/**
 * @param {object} props
 * @param {() => void} props.onClose
 * @param {object | null} [props.feedback] — lastPrivacyBudgetFeedback from API
 */
function FeedbackPopup({ onClose, feedback }) {
  const fb = feedback

  const levelScore = fb?.levelScore
  const basePoints = fb?.basePoints
  const bonus = fb?.bonus
  const penalty = fb?.penalty
  const band = fb?.feedbackBand ?? '—'
  const whatWorked = Array.isArray(fb?.whatWorked) ? fb.whatWorked : []
  const tightenNext = Array.isArray(fb?.tightenNextTime) ? fb.tightenNextTime : []
  const suggested = fb?.suggestedSetup ?? ''
  const breakdown = fb?.scoreBreakdown && typeof fb.scoreBreakdown === 'object' ? fb.scoreBreakdown : null

  const hasNumericSummary =
    levelScore != null || basePoints != null || bonus != null || penalty != null

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-2 md:p-4'>
      <div className='absolute inset-0 bg-black/45' aria-hidden />

      <div className='relative w-full max-w-[980px] max-h-[92vh] overflow-y-auto rounded-2xl border border-[#2d3150] bg-[#f1f2f6] p-2.5 md:p-3 shadow-2xl'>
        <div className='rounded-xl bg-[#35468a] text-white px-4 md:px-6 py-2.5 md:py-3 text-center'>
          <h2 className='text-2xl md:text-4xl font-extrabold leading-tight'>How your choices landed</h2>
          <p className='text-sm md:text-lg mt-1 font-medium'>
            This measures how close you are to a strong balance - not a simple right/wrong
          </p>
        </div>

        <div className='px-2 md:px-4 py-2.5 md:py-3'>
          <div className='border-t border-[#7b8097] pt-2 text-center'>
            {hasNumericSummary ? (
              <>
                {basePoints != null && (
                  <div className='text-xl md:text-3xl text-[#161a2d] font-medium'>
                    BASE POINTS:{' '}
                    <span className='text-[#2e3f80] font-extrabold'>+ {basePoints}</span>
                  </div>
                )}
                <div className='mt-2 inline-grid grid-cols-[auto_auto] gap-x-3 md:gap-x-6 gap-y-0.5 text-left text-base md:text-xl text-[#1f2436]'>
                  {bonus != null && bonus !== 0 && (
                    <>
                      <span>Bonus</span>
                      <span className='font-semibold text-[#2e3f80] text-right'>+{bonus}</span>
                    </>
                  )}
                  {penalty != null && penalty !== 0 && (
                    <>
                      <span>Penalty</span>
                      <span className='font-semibold text-[#2e3f80] text-right'>-{penalty}</span>
                    </>
                  )}
                  {breakdown &&
                    Object.entries(breakdown).map(([k, v]) => {
                      if (k === 'weights' || typeof v !== 'number') return null
                      return (
                        <React.Fragment key={k}>
                          <span className='capitalize'>{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className='font-semibold text-[#2e3f80] text-right'>{v}</span>
                        </React.Fragment>
                      )
                    })}
                  {levelScore != null && (
                    <>
                      <span>Total this round</span>
                      <span className='font-extrabold text-[#c28439] text-right'>= {levelScore}</span>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className='text-[#1f2436] text-lg'>No score details for this round.</p>
            )}
          </div>

          <div className='mt-3 rounded-xl border border-[#696f8c] bg-[#d9deee] px-3 md:px-5 py-2 grid grid-cols-3 items-center text-center'>
            <div>
              <p className='text-[10px] md:text-xs uppercase tracking-wide text-[#2d3555]'>Outcome band</p>
              <p className='text-lg md:text-2xl font-bold text-[#141a2f] capitalize'>{band}</p>
            </div>
            <div className='border-x border-[#646b8a]'>
              <p className='text-[10px] md:text-xs uppercase tracking-wide text-[#2d3555]'>Level score</p>
              <p className='text-lg md:text-2xl font-bold text-[#141a2f]'>
                {levelScore != null ? levelScore : '—'}
              </p>
            </div>
            <div>
              <p className='text-[10px] md:text-xs uppercase tracking-wide text-[#2d3555]'>Caption</p>
              <p className='text-sm md:text-lg font-bold text-[#141a2f] leading-tight'>
                {fb?.captionAi?.verdict ?? '—'}
              </p>
            </div>
          </div>

          <div className='mt-3 rounded-xl border border-[#676d8b] bg-[#f6f6f8] p-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div>
              <h3 className='text-2xl md:text-3xl font-bold text-[#2f3f7f]'>What worked</h3>
              <hr className='mt-1 mb-2 border-[#8b90a8]' />
              <div className='space-y-2.5'>
                {whatWorked.length ? (
                  whatWorked.map((text, i) => (
                    <FeedbackChip
                      key={i}
                      icon={<FaCheckCircle className='text-[#1ea34a]' />}
                      text={text}
                    />
                  ))
                ) : (
                  <p className='text-sm text-[#444]'>—</p>
                )}
              </div>
            </div>
            <div>
              <h3 className='text-2xl md:text-3xl font-bold text-[#2f3f7f]'>Tighten next time</h3>
              <hr className='mt-1 mb-2 border-[#8b90a8]' />
              <div className='space-y-2.5'>
                {tightenNext.length ? (
                  tightenNext.map((text, i) => (
                    <FeedbackChip
                      key={i}
                      icon={<FaInfoCircle className='text-[#d67a1d]' />}
                      text={text}
                      tone='warn'
                    />
                  ))
                ) : (
                  <p className='text-sm text-[#444]'>—</p>
                )}
              </div>
            </div>
          </div>

          {suggested ? (
            <div className='mt-3 rounded-xl border border-[#676d8b] bg-[#d9deee] p-3'>
              <div className='flex items-center gap-2'>
                <FaLightbulb className='text-[#f2bf2f]' />
                <h3 className='text-2xl md:text-3xl font-bold text-[#2f3f7f]'>Suggested setup</h3>
                <div className='h-px bg-[#7d86a7] flex-1' />
              </div>
              <p className='mt-2 text-sm md:text-lg text-[#26324f] leading-snug'>{suggested}</p>
            </div>
          ) : null}

          {fb?.captionAi?.reason ? (
            <p className='mt-2 text-sm text-[#334684]'>{fb.captionAi.reason}</p>
          ) : null}

          <div className='mt-3 flex justify-center'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl px-7 py-2 bg-[#1970e8] text-white text-lg md:text-2xl font-bold border border-[#1c4fa6] hover:brightness-105'
            >
              Next scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPopup
