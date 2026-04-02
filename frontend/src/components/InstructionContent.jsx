import React from 'react'
import {
  HiOutlineInformationCircle,
  HiOutlineAcademicCap,
  HiOutlineQueueList,
  HiOutlineAdjustmentsHorizontal,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'
import { FaRegThumbsUp } from 'react-icons/fa'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { MdOutlineLocationOn, MdOutlinePhotoCamera } from 'react-icons/md'
import logo from '../assets/Photo/WelcomePage/logo.png'

export const INSTR_NAVY = '#1A365D'
export const INSTR_SKY = '#BFE3FF'
export const INSTR_BTN = '#007BFF'
export const INSTR_ACCENT = '#2E5F9E'
export const INSTR_MUTED = '#3d4a63'

export function SectionCard({ icon: Icon, title, sectionId, children }) {
  const sid = sectionId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <section
      className="rounded-2xl border border-[#c5d9ef] bg-gradient-to-br from-[#e8f2fc] to-[#f5f9ff] p-4 shadow-sm sm:p-5"
      aria-labelledby={`instr-${sid}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl shadow-inner"
          style={{ backgroundColor: `${INSTR_SKY}`, border: `2px solid ${INSTR_NAVY}` }}
          aria-hidden
        >
          <Icon className="text-xl sm:text-2xl" style={{ color: INSTR_NAVY }} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id={`instr-${sid}`} className="mb-2 text-base font-bold leading-tight sm:text-lg" style={{ color: INSTR_NAVY }}>
            {title}
          </h2>
          <div className="text-sm sm:text-[15px] leading-relaxed space-y-2.5" style={{ color: INSTR_MUTED }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Shared instruction copy + layout (used by InstructionPage and InstructionPopup).
 * @param {{ headingId?: string, compactLogo?: boolean }} props
 */
export default function InstructionContent({ headingId = 'instruction-heading', compactLogo = false }) {
  return (
    <>
      <header className="mb-6 flex flex-col items-center text-center sm:mb-8">
        <img
          src={logo}
          alt=""
          className={`mb-3 h-auto object-contain drop-shadow-sm ${compactLogo ? 'w-[min(160px,45vw)]' : 'w-[min(200px,55vw)]'}`}
          width={200}
          height={80}
        />
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs"
          style={{ color: INSTR_ACCENT }}
        >
          Choice-based practice
        </p>
        <h1
          id={headingId}
          className="mb-3 max-w-4xl text-2xl font-extrabold leading-tight sm:text-3xl md:text-[2rem]"
          style={{ color: INSTR_NAVY }}
        >
          How to play
        </h1>
        <p className="max-w-3xl text-sm font-medium leading-relaxed sm:text-base" style={{ color: INSTR_MUTED }}>
          Read through each section, then jump in—your session has{' '}
          <span className="font-bold" style={{ color: INSTR_NAVY }}>
            10 scenarios
          </span>{' '}
          with feedback after every round.
        </p>
      </header>

      <div
        className="flex flex-col gap-4 sm:gap-5 rounded-3xl border-2 bg-white/90 p-4 shadow-[0_8px_40px_-12px_rgba(26,54,93,0.25)] backdrop-blur-sm sm:p-6 md:p-8"
        style={{ borderColor: INSTR_NAVY }}
      >
        <SectionCard sectionId="what-is" icon={HiOutlineInformationCircle} title="What is this game?">
          <p>
            <strong style={{ color: INSTR_NAVY }}>Privacy Budget</strong> is a short practice game about balancing what you
            share online. Like a real budget, you have limited “room”—each choice trades a bit of visibility for safety.
            You’ll see realistic post-style scenarios and adjust settings <em>before</em> you “send.”
          </p>
          <p>
            This is <strong>learning practice</strong>, not your real social accounts. Use it to build habits you can apply
            when you post for real.
          </p>
        </SectionCard>

        <SectionCard sectionId="learn" icon={HiOutlineAcademicCap} title="What you’ll learn">
          <ul className="list-none space-y-2 pl-0">
            {[
              <>
                <strong style={{ color: INSTR_NAVY }}>Audience</strong> — who should see the post (Public, Friends, Close
                Friends, Only Me) and when each option fits.
              </>,
              <>
                <strong style={{ color: INSTR_NAVY }}>Location tags</strong> — when a broad area tag is OK vs when a precise
                tag—or any tag—adds risk.
              </>,
              <>
                <strong style={{ color: INSTR_NAVY }}>Captions</strong> — when to keep default text vs edit it to remove
                time, place, or identity clues; thoughtful edits score better than empty or nonsense text.
              </>,
              <>
                <strong style={{ color: INSTR_NAVY }}>Photo choices</strong> — when crops or blurs help hide plates, signs,
                schedules, or other details in the image.
              </>,
            ].map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: INSTR_BTN }}
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p
            className="rounded-lg border border-dashed px-3 py-2.5 text-[13px] sm:text-sm"
            style={{ borderColor: '#9eb8d4', color: INSTR_MUTED }}
          >
            <FaRegThumbsUp className="mr-1.5 inline-block align-text-bottom text-[#1ea34a]" aria-hidden />
            Feedback measures how <em>balanced</em> your setup is—not a single “right answer” for every real-world post.
          </p>
        </SectionCard>

        <div
          className="rounded-2xl border-2 px-3 py-4 sm:px-5 sm:py-5"
          style={{
            borderColor: INSTR_NAVY,
            background: `linear-gradient(135deg, ${INSTR_SKY}33 0%, #fff 100%)`,
          }}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide sm:text-sm" style={{ color: INSTR_NAVY }}>
            Controls you’ll use
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { Icon: IoChatbubbleEllipsesOutline, label: 'Audience', sub: 'Who sees it' },
              { Icon: MdOutlineLocationOn, label: 'Location', sub: 'Tag on / off' },
              { Icon: HiOutlinePencilSquare, label: 'Caption', sub: 'Keep or edit' },
              { Icon: MdOutlinePhotoCamera, label: 'Photo', sub: 'Original, A, or B' },
            ].map(({ Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-xl border bg-white/90 px-2 py-3 text-center shadow-sm"
                style={{ borderColor: '#c5d4e8' }}
              >
                <Icon className="mb-1.5 text-2xl" style={{ color: INSTR_ACCENT }} aria-hidden />
                <span className="text-xs font-bold leading-tight sm:text-sm" style={{ color: INSTR_NAVY }}>
                  {label}
                </span>
                <span className="mt-0.5 text-[10px] leading-tight sm:text-xs" style={{ color: INSTR_MUTED }}>
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        <SectionCard sectionId="how-to" icon={HiOutlineQueueList} title="How to play">
          <ol className="list-none space-y-3 pl-0">
            {[
              'Read the scenario and look at the default post.',
              'Adjust audience, location, caption, and photo using the controls.',
              'Tap Post Now to submit your choices for that level.',
              'Read the feedback—what worked, what to tighten next time.',
              'Continue through all 10 scenarios.',
              'At the end, review your overall results.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white sm:h-8 sm:w-8 sm:text-sm"
                  style={{ backgroundColor: INSTR_NAVY }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard sectionId="each-level" icon={HiOutlineAdjustmentsHorizontal} title="What you do each level">
          <ul className="list-none space-y-2 pl-0">
            {[
              'Choose an audience that matches how private this moment should be.',
              'Turn the location tag on or off—and when it’s on, keep it broad if the level calls for that.',
              'Keep the caption or rewrite it so it doesn’t pile on risky details.',
              'Pick the photo option that best protects what’s sensitive in the frame.',
              'Submit with Post Now and learn from the feedback.',
            ].map((line, i) => (
              <li key={i} className="flex gap-2.5 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className="font-bold tabular-nums" style={{ color: INSTR_BTN }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  )
}
