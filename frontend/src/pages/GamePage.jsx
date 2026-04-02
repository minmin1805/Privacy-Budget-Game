import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ImagePickerPopup from '../components/ImagePickerPopup'
import FeedbackPopup from '../components/FeedbackPopup'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'
import { getMergedLevelAssets, hasOnlyOptionA } from '../utils/levelAssets'
import { computeLiveMeters } from '../utils/liveMeters'
import fallbackProfile from '../assets/Photo/GamePage/mockprofile.png'
import fallbackPost from '../assets/Photo/GamePage/postimage.png'
import { FaHeart, FaMapMarkerAlt, FaRegCommentDots, FaRegShareSquare, FaRegThumbsUp } from 'react-icons/fa'
import { IoShield } from 'react-icons/io5'

const pillBase =
  'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors duration-200'

function ToggleRow({ label, left, right, leftActive = true, onLeftClick, onRightClick }) {
  return (
    <div className='rounded-xl border border-[#5f6686] bg-white px-4 py-3 flex items-center justify-between gap-4'>
      <span className='text-sm md:text-base font-semibold text-[#1b2244]'>{label}</span>
      <div className='rounded-md bg-[#e8ebfa] p-1 flex items-center'>
        <button
          type='button'
          onClick={onLeftClick}
          className={`${pillBase} ${leftActive ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-transparent'}`}
        >
          {left}
        </button>
        <button
          type='button'
          onClick={onRightClick}
          className={`${pillBase} ${!leftActive ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-transparent'}`}
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
            className={`${pillBase} ${value === opt ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-[#94a3b8]'}`}
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
    <div className='bg-[#4860bd] rounded-xl px-4 py-2 text-white shadow-sm'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='text-3xl shrink-0'>{icon}</span>
          <div className='min-w-0'>
            <h3 className='text-lg md:text-xl font-bold leading-tight'>{title}</h3>
            {hint ? <p className='text-xs text-[#dfe5ff] mt-0.5 leading-snug'>{hint}</p> : null}
          </div>
        </div>
        <span className='text-3xl md:text-4xl font-bold shrink-0'>{score}</span>
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [pendingNavigateEndgame, setPendingNavigateEndgame] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    if (!playerId) {
      navigate('/welcome', { replace: true })
    }
  }, [hydrated, playerId, navigate])

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
    nextLevel()
    if (goEnd) {
      navigate('/endgame')
    }
  }, [pendingNavigateEndgame, nextLevel, navigate])

  const scrollToPreview = () => {
    postCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { privacyPct, engagementPct } = useMemo(
    () => computeLiveMeters(draft, currentLevelConfig),
    [draft, currentLevelConfig],
  )

  if (!hydrated || !playerId) {
    return (
      <div className='min-h-screen bg-[#ebedf2] flex items-center justify-center text-[#1b2244]'>
        Loading…
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#ebedf2]'>
      <Header currentLevel={currentLevel} totalLevels={10} totalScore={privacyTotalScore} />

      <main className='max-w-[1720px] mx-auto px-4 md:px-6 py-3 mt-5'>
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
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

        <section className='grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mt-7'>
          <div className='space-y-3'>
            <article className='rounded-lg border border-[#373a47] bg-white px-4 py-3'>
              <h2 className='text-2xl md:text-4xl font-bold text-[#1b2244] leading-tight'>
                Scenario: {currentLevelConfig?.title ?? `Level ${currentLevel}`}
              </h2>
              <hr className='my-2 border-[#5d6475]' />
              <p className='text-lg md:text-[20px] text-[#222639] leading-snug'>
                {currentLevelConfig?.scenarioDescription ?? ''}
              </p>
            </article>

            <article ref={postCardRef} className='rounded-lg border border-[#373a47] bg-white overflow-hidden'>
              <div className='px-4 py-3'>
                <h2 className='text-xl md:text-[32px] font-bold text-[#1b2244] leading-tight'>Your New Post</h2>
                <hr className='my-2 border-[#5d6475]' />

                <div className='flex items-center justify-between gap-3 mb-3'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={profileSrc}
                      alt='Profile'
                      className='w-12 h-12 md:w-14 md:h-14 rounded-full object-cover'
                    />
                    <div>
                      <p className='font-bold text-sm md:text-base text-[#161a2d]'>{username || 'Player'}</p>
                      <p className='text-[#3973ba] text-xs md:text-sm'>Privacy Budget</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-md md:text-lg text-[#161a2d]'>Audience:</span>
                    <span className='px-4 py-1 rounded-lg bg-[#1f7dff] text-white text-sm md:text-lg font-semibold max-w-[140px] truncate'>
                      {draft.audience}
                    </span>
                  </div>
                </div>
              </div>

              <div className='w-full border-y border-[#404454] bg-[#e8eaf1] flex items-center justify-center'>
                <img
                  src={postSrc}
                  alt='Post content'
                  className='w-full max-w-full max-h-[min(78dvh,920px)] h-auto object-contain'
                />
              </div>

              <div className='px-4 py-3'>
                <p className='text-base md:text-[24px] leading-tight text-[#1b1e2d]'>
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

              <div className='px-4 py-3 border-t border-[#5d6475] flex items-center justify-around text-[#1b1f32]'>
                <button type='button' className='flex items-center gap-2 text-lg md:text-xl'>
                  <FaRegThumbsUp size={20} />
                  <span>Like</span>
                </button>
                <button type='button' className='flex items-center gap-2 text-lg md:text-xl'>
                  <FaRegCommentDots size={20} />
                  <span>Comment</span>
                </button>
                <button type='button' className='flex items-center gap-2 text-lg md:text-xl'>
                  <FaRegShareSquare size={20} />
                  <span>Share</span>
                </button>
              </div>
            </article>
          </div>

          <aside className='rounded-3xl border border-[#66709b] bg-[#dfe4f4] overflow-hidden h-fit mt-15'>
            <div className='bg-[#4860bd] px-5 py-3'>
              <h2 className='text-white text-2xl md:text-4xl font-bold leading-[0.95]'>Adjust Setting Here:</h2>
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
                  className='w-full rounded-lg border-2 border-[#5f6686] px-3 py-2 text-sm text-[#1b2244]'
                  placeholder='Write your caption…'
                />
              )}

              <ToggleRow
                label='Photo Crop:'
                left='Original'
                right='Crop/Blur Image'
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
                className='w-full py-2.5 mt-1 rounded-lg text-lg md:text-xl font-bold text-white bg-[#79a7e8] border border-[#3e5a96]'
              >
                Show post preview
              </button>
              <button
                type='button'
                onClick={handlePostNow}
                disabled={loading || Boolean(privacyBudgetCompletedAt)}
                className='w-full py-2.5 rounded-lg text-lg md:text-xl font-bold text-white bg-[#2f79df] border border-[#234f92] disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Posting…' : privacyBudgetCompletedAt ? 'Session complete' : 'Post Now'}
              </button>
            </div>
          </aside>
        </section>
      </main>

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
