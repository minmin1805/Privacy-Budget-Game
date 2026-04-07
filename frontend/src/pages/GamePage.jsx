import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import InstructionPopup from '../components/InstructionPopup'
import ImagePickerPopup from '../components/ImagePickerPopup'
import FeedbackPopup from '../components/FeedbackPopup'
import GameCountdownOverlay from '../components/GameCountdownOverlay'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'
import { getMergedLevelAssets, hasOnlyOptionA } from '../utils/levelAssets'
import { computeLiveMeters } from '../utils/liveMeters'
import fallbackProfile from '../assets/Photo/GamePage/mockprofile.png'
import fallbackPost from '../assets/Photo/GamePage/postimage.png'
import { FaHeart, FaMapMarkerAlt, FaRegCommentDots, FaRegShareSquare, FaRegThumbsUp } from 'react-icons/fa'
import { IoShield } from 'react-icons/io5'

const INTRO_COUNTDOWN_DONE = 'pb_intro_countdown_done'
const INTRO_COUNTDOWN_LOCK = 'pb_intro_countdown_lock'

const pillBase =
  'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors duration-200'

function ToggleRow({ label, left, right, leftActive = true, onLeftClick, onRightClick }) {
  return (
    <div className='rounded-xl border border-[#5f6686] bg-white px-3 py-2.5 sm:px-4 w-full min-w-0 grid items-center gap-x-2 sm:gap-x-4 [grid-template-columns:minmax(0,1fr)_auto]'>
      <span className='text-sm md:text-base font-semibold text-[#1b2244] min-w-0 truncate'>{label}</span>
      <div className='rounded-md bg-[#e8ebfa] p-1 inline-flex flex-nowrap items-center gap-1 w-max max-w-full'>
        <button
          type='button'
          onClick={onLeftClick}
          className={`${pillBase} min-h-[44px] sm:min-h-0 ${leftActive ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-transparent'}`}
        >
          {left}
        </button>
        <button
          type='button'
          onClick={onRightClick}
          className={`${pillBase} min-h-[44px] sm:min-h-0 ${!leftActive ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-transparent'}`}
        >
          {right}
        </button>
      </div>
    </div>
  )
}

function AudienceRow({ options, value, onChange }) {
  return (
    <div className='rounded-xl border border-[#5f6686] bg-white px-4 py-3'>
      <p className='text-sm md:text-base font-semibold text-[#1b2244] mb-2'>Audience:</p>
      <div className='flex flex-wrap gap-2'>
        {options.map((opt) => (
          <button
            key={opt}
            type='button'
            onClick={() => onChange(opt)}
            className={`${pillBase} min-h-[44px] sm:min-h-0 ${value === opt ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-[#94a3b8]'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScoreCard({ icon, title, score, value = 70, hint }) {
  return (
    <div className='bg-[#4860bd] rounded-xl px-3 py-2.5 sm:px-4 sm:py-2 text-white shadow-sm'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='text-2xl sm:text-3xl shrink-0'>{icon}</span>
          <div className='min-w-0'>
            <h3 className='text-base sm:text-lg md:text-xl font-bold leading-tight'>{title}</h3>
            {hint ? <p className='text-[10px] sm:text-xs text-[#dfe5ff] mt-0.5 leading-snug'>{hint}</p> : null}
          </div>
        </div>
        <span className='text-2xl sm:text-3xl md:text-4xl font-bold shrink-0 tabular-nums'>{score}</span>
      </div>
      <div className='mt-2 h-3 bg-[#dfe5ff] rounded-full overflow-hidden'>
        <div className='h-full bg-white rounded-full transition-[width] duration-200' style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function postImageForDraft(draft, assets) {
  if (draft.photoOption === 'Option A') return assets.optionA ?? assets.post ?? fallbackPost
  if (draft.photoOption === 'Option B') return assets.optionB ?? assets.post ?? fallbackPost
  return assets.post ?? fallbackPost
}

export default function GamePage() {
  const navigate = useNavigate()
  const postCardRef = useRef(null)

  const {
    playerId,
    username,
    currentLevel,
    currentLevelConfig,
    draft,
    updateDraft,
    submitLevel,
    nextLevel,
    lastFeedback,
    privacyTotalScore,
    privacyBudgetCompletedAt,
    audienceOptions,
    loading,
    error,
    hydrated,
  } = usePrivacyBudget()

  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [isInstructionOpen, setIsInstructionOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [pendingNavigateEndgame, setPendingNavigateEndgame] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState(null)

  useEffect(() => {
    if (!hydrated) return
    if (!playerId) {
      navigate('/welcome', { replace: true })
    }
  }, [hydrated, playerId, navigate])

  const runCountdownSequence = useCallback((onDone) => {
    setCountdownNumber(3)
    window.setTimeout(() => {
      setCountdownNumber(2)
      window.setTimeout(() => {
        setCountdownNumber(1)
        window.setTimeout(() => {
          setCountdownNumber(null)
          onDone()
        }, 750)
      }, 750)
    }, 750)
  }, [])

  useEffect(() => {
    if (!hydrated || !playerId) return
    if (currentLevel !== 1) return
    if (sessionStorage.getItem(INTRO_COUNTDOWN_DONE)) return
    if (sessionStorage.getItem(INTRO_COUNTDOWN_LOCK)) return
    sessionStorage.setItem(INTRO_COUNTDOWN_LOCK, '1')
    let cancelled = false
    runCountdownSequence(() => {
      sessionStorage.removeItem(INTRO_COUNTDOWN_LOCK)
      if (cancelled) return
      sessionStorage.setItem(INTRO_COUNTDOWN_DONE, '1')
    })
    return () => {
      cancelled = true
      sessionStorage.removeItem(INTRO_COUNTDOWN_LOCK)
    }
  }, [hydrated, playerId, currentLevel, runCountdownSequence])

  const assets = useMemo(
    () => getMergedLevelAssets(currentLevel, currentLevelConfig),
    [currentLevel, currentLevelConfig],
  )
  const singleOptionOnly = useMemo(
    () => hasOnlyOptionA(currentLevel, currentLevelConfig),
    [currentLevel, currentLevelConfig],
  )

  const profileSrc = assets.profile ?? fallbackProfile
  const postSrc = useMemo(() => postImageForDraft(draft, assets), [draft, assets])

  const photoLabels = currentLevelConfig?.photoOptionLabels ?? {}
  const optALabel = photoLabels['Option A'] ?? {}
  const optBLabel = photoLabels['Option B'] ?? {}
  const optionATitle = optALabel.title ?? 'Option A'
  const optionBTitle = optBLabel.title ?? 'Option B'
  const optionASubtitle = optALabel.subtitle
  const optionBSubtitle = optBLabel.subtitle
  const optionADescription = optALabel.description
  const optionBDescription = optBLabel.description

  const openImagePicker = () => setIsImagePickerOpen(true)
  const closeImagePicker = () => setIsImagePickerOpen(false)

  const handleImageSubmit = (pickedOption) => {
    updateDraft({ photoOption: pickedOption })
    setIsImagePickerOpen(false)
  }

  const handleChooseOriginal = () => {
    updateDraft({ photoOption: 'Original' })
  }

  const handlePostNow = async () => {
    try {
      const data = await submitLevel()
      setPendingNavigateEndgame(Boolean(data.privacyBudgetCompletedAt))
      setIsFeedbackOpen(true)
    } catch {
      // error surfaced via context
    }
  }

  const handleFeedbackNext = useCallback(() => {
    const goEnd = pendingNavigateEndgame
    setIsFeedbackOpen(false)
    setPendingNavigateEndgame(false)
    if (goEnd) {
      nextLevel()
      navigate('/endgame')
      return
    }
    runCountdownSequence(() => {
      nextLevel()
    })
  }, [pendingNavigateEndgame, nextLevel, navigate, runCountdownSequence])

  const scrollToPreview = () => {
    postCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { privacyPct, engagementPct } = useMemo(
    () => computeLiveMeters(draft, currentLevelConfig),
    [draft, currentLevelConfig],
  )

  if (!hydrated || !playerId) {
    return (
      <div className='min-h-[100dvh] bg-[#ebedf2] flex items-center justify-center text-[#1b2244] px-4 text-center'>
        Loading…
      </div>
    )
  }

  return (
    <div className='min-h-[100dvh] bg-[#ebedf2] relative pb-[env(safe-area-inset-bottom)]'>
      <GameCountdownOverlay value={countdownNumber} />
      <Header
        currentLevel={currentLevel}
        totalLevels={10}
        totalScore={privacyTotalScore}
        onHelpClick={() => setIsInstructionOpen(true)}
      />

      <main className='max-w-[1720px] mx-auto px-3 sm:px-4 md:px-6 py-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] mt-2 sm:mt-5'>
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4'>
          <ScoreCard
            icon={<IoShield />}
            title='Privacy level'
            score={privacyPct}
            value={privacyPct}
            hint='Live preview from your current settings on this scenario.'
          />
          <ScoreCard
            icon={<FaHeart className='text-[#ff4f6f]' />}
            title='Engagement level'
            score={engagementPct}
            value={engagementPct}
            hint='Live preview—more open sharing reads higher; tighter audience reads lower.'
          />
        </section>

        {/* Mobile: scenario → post → adjust settings. xl: left column = scenario + post, right = sticky aside */}
        <section className='grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-4 mt-4 xl:mt-7'>
            <article className='min-w-0 xl:col-start-1 xl:row-start-1 rounded-lg border border-[#373a47] bg-white px-3 py-3 sm:px-4'>
              <h2 className='text-xl sm:text-2xl md:text-4xl font-bold text-[#1b2244] leading-tight'>
                Scenario: {currentLevelConfig?.title ?? `Level ${currentLevel}`}
              </h2>
              <hr className='my-2 border-[#5d6475]' />
              <p className='text-base sm:text-lg md:text-[20px] text-[#222639] leading-snug'>
                {currentLevelConfig?.scenarioDescription ?? ''}
              </p>
            </article>

            <article ref={postCardRef} className='min-w-0 xl:col-start-1 xl:row-start-2 rounded-lg border border-[#373a47] bg-white overflow-hidden'>
              <div className='px-3 py-3 sm:px-4'>
                <h2 className='text-lg sm:text-xl md:text-[32px] font-bold text-[#1b2244] leading-tight'>Your New Post</h2>
                <hr className='my-2 border-[#5d6475]' />

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <img
                      src={profileSrc}
                      alt='Profile'
                      className='w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0'
                    />
                    <div className='min-w-0'>
                      <p className='font-bold text-sm md:text-base text-[#161a2d] truncate'>
                        {currentLevelConfig?.profileName?.trim() || username || 'Player'}
                      </p>
                      <p className='text-[#3973ba] text-xs md:text-sm'>Privacy Budget</p>
                    </div>
                  </div>
                  <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
                    <span className='text-sm md:text-lg text-[#161a2d] shrink-0'>Audience:</span>
                    <span className='px-3 py-1.5 rounded-lg bg-[#1f7dff] text-white text-xs sm:text-sm md:text-lg font-semibold max-w-full sm:max-w-[180px] truncate'>
                      {draft.audience}
                    </span>
                  </div>
                </div>
              </div>

              <div className='w-full border-y border-[#404454] bg-[#e8eaf1] flex items-center justify-center'>
                <img
                  src={postSrc}
                  alt='Post content'
                  className='w-full max-w-full max-h-[min(52dvh,480px)] sm:max-h-[min(65dvh,720px)] xl:max-h-[min(78dvh,920px)] h-auto object-contain'
                />
              </div>

              <div className='px-3 py-3 sm:px-4'>
                <p className='text-sm sm:text-base md:text-[24px] leading-tight text-[#1b1e2d] break-words'>
                  {draft.captionMode === 'edit'
                    ? draft.captionText || '(Your edited caption)'
                    : currentLevelConfig?.defaultPost?.caption ?? draft.captionText}
                </p>
                {draft.locationTagOn && currentLevelConfig?.locationTagDisplay?.primary && (
                  <div className='mt-3 flex items-start gap-2'>
                    <FaMapMarkerAlt
                      className='mt-0.5 shrink-0 text-[#3973ba]'
                      size={16}
                      aria-hidden
                    />
                    <div className='min-w-0'>
                      <p className='text-sm md:text-base font-semibold text-[#1b2244] leading-snug'>
                        {currentLevelConfig.locationTagDisplay.primary}
                      </p>
                      {currentLevelConfig.locationTagDisplay.subtitle ? (
                        <p className='text-xs md:text-sm text-[#5d6475] mt-0.5 leading-snug'>
                          {currentLevelConfig.locationTagDisplay.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className='px-2 py-2 sm:px-4 sm:py-3 border-t border-[#5d6475] flex items-center justify-between sm:justify-around text-[#1b1f32] gap-1'>
                <button
                  type='button'
                  className='flex flex-1 sm:flex-initial min-h-[44px] items-center justify-center gap-1.5 text-sm sm:text-lg md:text-xl px-1'
                >
                  <FaRegThumbsUp size={18} className='sm:w-5 sm:h-5' />
                  <span>Like</span>
                </button>
                <button
                  type='button'
                  className='flex flex-1 sm:flex-initial min-h-[44px] items-center justify-center gap-1.5 text-sm sm:text-lg md:text-xl px-1'
                >
                  <FaRegCommentDots size={18} className='sm:w-5 sm:h-5' />
                  <span>Comment</span>
                </button>
                <button
                  type='button'
                  className='flex flex-1 sm:flex-initial min-h-[44px] items-center justify-center gap-1.5 text-sm sm:text-lg md:text-xl px-1'
                >
                  <FaRegShareSquare size={18} className='sm:w-5 sm:h-5' />
                  <span>Share</span>
                </button>
              </div>
            </article>

          <aside className='rounded-3xl border border-[#66709b] bg-[#dfe4f4] overflow-hidden h-fit xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:sticky xl:top-3 xl:max-h-[calc(100dvh-5rem)] xl:overflow-y-auto'>
            <div className='bg-[#4860bd] px-4 py-3 sm:px-5'>
              <h2 className='text-white text-lg sm:text-2xl md:text-4xl font-bold leading-tight'>
                Adjust settings
              </h2>
            </div>

            <div className='p-3 space-y-2.5'>
              {error && (
                <p className='text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-2 py-1'>
                  {error}
                </p>
              )}

              <AudienceRow
                options={audienceOptions}
                value={draft.audience}
                onChange={(audience) => updateDraft({ audience })}
              />

              <ToggleRow
                label='Location Tag:'
                left='On'
                right='Off'
                leftActive={draft.locationTagOn}
                onLeftClick={() => updateDraft({ locationTagOn: true })}
                onRightClick={() => updateDraft({ locationTagOn: false })}
              />

              <ToggleRow
                label='Caption Detail:'
                left='Keep'
                right='Edit'
                leftActive={draft.captionMode === 'keep'}
                onLeftClick={() => updateDraft({ captionMode: 'keep' })}
                onRightClick={() => updateDraft({ captionMode: 'edit' })}
              />

              {draft.captionMode === 'edit' && (
                <textarea
                  value={draft.captionText}
                  onChange={(e) => updateDraft({ captionText: e.target.value })}
                  rows={3}
                  className='w-full rounded-lg border-2 border-[#5f6686] px-3 py-2.5 text-base text-[#1b2244]'
                  placeholder='Write your caption…'
                  style={{ fontSize: '16px' }}
                />
              )}

              <ToggleRow
                label='Photo Crop:'
                left='Original'
                right='Crop / blur'
                leftActive={draft.photoOption === 'Original'}
                onLeftClick={handleChooseOriginal}
                onRightClick={openImagePicker}
              />

              {draft.photoOption !== 'Original' && (
                <p className='text-xs text-[#1b2244] font-medium'>Selected: {draft.photoOption}</p>
              )}

              <button
                type='button'
                onClick={scrollToPreview}
                className='w-full py-3 mt-1 rounded-lg text-base sm:text-lg md:text-xl font-bold text-white bg-[#79a7e8] border border-[#3e5a96] min-h-[48px]'
              >
                Show post preview
              </button>
              <button
                type='button'
                onClick={handlePostNow}
                disabled={loading || Boolean(privacyBudgetCompletedAt)}
                className='w-full py-3 rounded-lg text-base sm:text-lg md:text-xl font-bold text-white bg-[#2f79df] border border-[#234f92] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]'
              >
                {loading ? 'Posting…' : privacyBudgetCompletedAt ? 'Session complete' : 'Post Now'}
              </button>
            </div>
          </aside>
        </section>
      </main>

      {isInstructionOpen && (
        <InstructionPopup onClose={() => setIsInstructionOpen(false)} />
      )}

      {isImagePickerOpen && (
        <ImagePickerPopup
          onClose={closeImagePicker}
          onSubmit={handleImageSubmit}
          optionAUrl={assets.optionA}
          optionBUrl={assets.optionB}
          optionATitle={optionATitle}
          optionBTitle={optionBTitle}
          optionASubtitle={optionASubtitle}
          optionBSubtitle={optionBSubtitle}
          optionADescription={optionADescription}
          optionBDescription={optionBDescription}
          singleOptionOnly={singleOptionOnly}
        />
      )}

      {isFeedbackOpen && (
        <FeedbackPopup feedback={lastFeedback} onClose={handleFeedbackNext} />
      )}
    </div>
  )
}
