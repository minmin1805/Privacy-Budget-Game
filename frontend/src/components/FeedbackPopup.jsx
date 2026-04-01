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

function FeedbackPopup({ onClose }) {
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-2 md:p-4'>
      <div className='absolute inset-0 bg-black/45' onClick={onClose} aria-hidden />

      <div className='relative w-full max-w-[980px] max-h-[92vh] overflow-y-auto rounded-2xl border border-[#2d3150] bg-[#f1f2f6] p-2.5 md:p-3 shadow-2xl'>
        <div className='rounded-xl bg-[#35468a] text-white px-4 md:px-6 py-2.5 md:py-3 text-center'>
          <h2 className='text-2xl md:text-4xl font-extrabold leading-tight'>How your choices landed</h2>
          <p className='text-sm md:text-lg mt-1 font-medium'>
            This measures how close you are to a strong balance - not a simple right/wrong
          </p>
        </div>

        <div className='px-2 md:px-4 py-2.5 md:py-3'>
          <div className='border-t border-[#7b8097] pt-2 text-center'>
            <div className='text-xl md:text-4xl text-[#161a2d] font-medium'>
              BASE POINTS: <span className='text-[#2e3f80] font-extrabold'>+ 300</span>
            </div>
            <div className='mt-2 inline-grid grid-cols-[auto_auto] gap-x-3 md:gap-x-6 gap-y-0.5 text-left text-base md:text-2xl text-[#1f2436]'>
              <span>Budget efficiency bonus (3 left)</span>
              <span className='font-semibold text-[#2e3f80] text-right'>+120</span>
              <span>Waste penalty (1 unnecessary step)</span>
              <span className='font-semibold text-[#2e3f80] text-right'>-40</span>
              <span>Scenario multiplier</span>
              <span className='font-semibold text-[#2e3f80] text-right'>x1.0</span>
              <span>Total this round</span>
              <span className='font-extrabold text-[#c28439] text-right'>=420</span>
            </div>
          </div>

          <div className='mt-3 rounded-xl border border-[#696f8c] bg-[#d9deee] px-3 md:px-5 py-2 grid grid-cols-3 items-center text-center'>
            <div>
              <p className='text-[10px] md:text-xs uppercase tracking-wide text-[#2d3555]'>Budget used</p>
              <p className='text-2xl md:text-4xl font-bold text-[#141a2f]'>7/10</p>
            </div>
            <div className='border-x border-[#646b8a]'>
              <p className='text-[10px] md:text-xs uppercase tracking-wide text-[#2d3555]'>Privacy exposure</p>
              <p className='text-2xl md:text-4xl font-bold text-[#141a2f]'>Medium-low</p>
            </div>
            <div>
              <p className='text-[10px] md:text-xs uppercase tracking-wide text-[#2d3555]'>Engagement reach</p>
              <p className='text-2xl md:text-4xl font-bold text-[#141a2f]'>Good</p>
            </div>
          </div>

          <div className='mt-3 rounded-xl border border-[#676d8b] bg-[#f6f6f8] p-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div>
              <h3 className='text-3xl md:text-4xl font-bold text-[#2f3f7f]'>What worked</h3>
              <hr className='mt-1 mb-2 border-[#8b90a8]' />
              <div className='space-y-2.5'>
                <FeedbackChip
                  icon={<FaCheckCircle className='text-[#1ea34a]' />}
                  text='You limited who could see the post compared to the widest setting'
                />
                <FeedbackChip
                  icon={<FaCheckCircle className='text-[#1ea34a]' />}
                  text='You reduced how much of the scene stayed visible in the image'
                />
              </div>
            </div>
            <div>
              <h3 className='text-3xl md:text-4xl font-bold text-[#2f3f7f]'>Tighten next time</h3>
              <hr className='mt-1 mb-2 border-[#8b90a8]' />
              <div className='space-y-2.5'>
                <FeedbackChip
                  icon={<FaInfoCircle className='text-[#d67a1d]' />}
                  text='Location context may still anchor you to a routine place'
                  tone='warn'
                />
                <FeedbackChip
                  icon={<FaInfoCircle className='text-[#d67a1d]' />}
                  text='Caption details can accidentally restate what the image already shows'
                  tone='warn'
                />
              </div>
            </div>
          </div>

          <div className='mt-3 rounded-xl border border-[#676d8b] bg-[#d9deee] p-3'>
            <div className='flex items-center gap-2'>
              <FaLightbulb className='text-[#f2bf2f]' />
              <h3 className='text-3xl md:text-4xl font-bold text-[#2f3f7f]'>Suggested setup</h3>
              <div className='h-px bg-[#7d86a7] flex-1' />
            </div>
            <p className='mt-2 text-sm md:text-lg text-[#26324f] leading-snug'>
              Try a slightly smaller audience + turn location off + pick the safer crop - then re-check the preview before posting. This is guidance based on this scenario&apos;s goals.
            </p>
          </div>

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
