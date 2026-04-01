import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import privacyBudgetData from '../data/privacyBudgetLevels.json'
import { createPlayer, updatePlayer } from '../services/playerService'

const STORAGE_KEY = 'privacyBudgetGame'

const PrivacyBudgetContext = createContext(null)

function loadStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function defaultDraftFromLevel(levelId) {
  const level = privacyBudgetData.levels.find((l) => l.id === levelId)
  if (!level) {
    return {
      audience: 'Public',
      locationTagOn: true,
      captionMode: 'keep',
      captionText: '',
      photoOption: 'Original',
    }
  }
  const d = level.defaultPost
  return {
    audience: d.audience,
    locationTagOn: Boolean(d.locationTagOn),
    captionMode: d.captionMode === 'edit' ? 'edit' : 'keep',
    captionText: d.caption ?? '',
    photoOption: d.photoOption ?? 'Original',
  }
}

export function PrivacyBudgetProvider({ children }) {
  const [playerId, setPlayerId] = useState(null)
  const [username, setUsername] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [draft, setDraft] = useState(() => defaultDraftFromLevel(1))
  const [lastFeedback, setLastFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  const persist = useCallback(
    (next) => {
      const payload = {
        playerId: next.playerId ?? playerId,
        username: next.username ?? username,
        sessionId: next.sessionId ?? sessionId,
        currentLevel: next.currentLevel ?? currentLevel,
        draft: next.draft ?? draft,
      }
      if (payload.playerId) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      }
    },
    [playerId, username, sessionId, currentLevel, draft],
  )

  useEffect(() => {
    const s = loadStored()
    if (s?.playerId) {
      setPlayerId(s.playerId)
      setUsername(s.username ?? '')
      setSessionId(s.sessionId ?? null)
      setCurrentLevel(typeof s.currentLevel === 'number' ? s.currentLevel : 1)
      setDraft(s.draft ?? defaultDraftFromLevel(s.currentLevel ?? 1))
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !playerId) return
    persist({})
  }, [hydrated, playerId, username, sessionId, currentLevel, draft, persist])

  const currentLevelConfig = useMemo(() => {
    return privacyBudgetData.levels.find((l) => l.id === currentLevel) ?? null
  }, [currentLevel])

  const applyDraftForLevel = useCallback((levelId) => {
    setDraft(defaultDraftFromLevel(levelId))
  }, [])

  const registerPlayer = useCallback(
    (created) => {
      setPlayerId(created.id)
      setUsername(created.name ?? '')
      setSessionId(created.sessionId ?? null)
      setCurrentLevel(1)
      setLastFeedback(null)
      setError(null)
      const d1 = defaultDraftFromLevel(1)
      setDraft(d1)
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          playerId: created.id,
          username: created.name ?? '',
          sessionId: created.sessionId ?? null,
          currentLevel: 1,
          draft: d1,
        }),
      )
    },
    [],
  )

  const createPlayerAndRegister = useCallback(async (name) => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name.')
      throw new Error('Please enter your name.')
    }
    setLoading(true)
    setError(null)
    try {
      const data = await createPlayer(trimmed)
      registerPlayer({
        id: data.id,
        name: data.name,
        sessionId: data.sessionId,
      })
      return data
    } catch (e) {
      const msg = e?.message || 'Could not create player.'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [registerPlayer])

  const updateDraft = useCallback((partial) => {
    setDraft((d) => ({ ...d, ...partial }))
  }, [])

  const submitLevel = useCallback(async () => {
    if (!playerId) {
      const msg = 'No player session.'
      setError(msg)
      throw new Error(msg)
    }
    setLoading(true)
    setError(null)
    try {
      const body = {
        privacyBudgetLevelSubmission: {
          levelId: currentLevel,
          selectedAudience: draft.audience,
          selectedLocationTag: draft.locationTagOn,
          captionMode: draft.captionMode,
          selectedCaption: draft.captionText ?? '',
          selectedPhotoOption: draft.photoOption,
        },
      }
      const data = await updatePlayer(playerId, body)
      setLastFeedback(data.lastPrivacyBudgetFeedback ?? null)

      const nextLevel =
        typeof data.privacyBudgetCurrentLevel === 'number'
          ? data.privacyBudgetCurrentLevel
          : currentLevel + 1

      setCurrentLevel(nextLevel)
      if (nextLevel >= 1 && nextLevel <= 10) {
        applyDraftForLevel(nextLevel)
      }

      return data
    } catch (e) {
      const msg = e?.message || 'Submit failed.'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [playerId, currentLevel, draft, applyDraftForLevel])

  const nextLevel = useCallback(() => {
    setLastFeedback(null)
  }, [])

  const reset = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setPlayerId(null)
    setUsername('')
    setSessionId(null)
    setCurrentLevel(1)
    setDraft(defaultDraftFromLevel(1))
    setLastFeedback(null)
    setError(null)
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      levels: privacyBudgetData.levels,
      audienceOptions: privacyBudgetData.audienceOptions,
      photoOptionsOrder: privacyBudgetData.photoOptionsOrder,
      playerId,
      username,
      sessionId,
      currentLevel,
      currentLevelConfig,
      draft,
      lastFeedback,
      loading,
      error,
      hydrated,
      setError,
      updateDraft,
      registerPlayer,
      createPlayerAndRegister,
      submitLevel,
      nextLevel,
      reset,
      applyDraftForLevel,
    }),
    [
      playerId,
      username,
      sessionId,
      currentLevel,
      currentLevelConfig,
      draft,
      lastFeedback,
      loading,
      error,
      hydrated,
      updateDraft,
      registerPlayer,
      createPlayerAndRegister,
      submitLevel,
      nextLevel,
      reset,
      applyDraftForLevel,
    ],
  )

  return (
    <PrivacyBudgetContext.Provider value={value}>
      {children}
    </PrivacyBudgetContext.Provider>
  )
}

export function usePrivacyBudget() {
  const ctx = useContext(PrivacyBudgetContext)
  if (!ctx) {
    throw new Error('usePrivacyBudget must be used within PrivacyBudgetProvider')
  }
  return ctx
}
