/**
 * Instant-read “meters” for the current level draft (0–100 each).
 * Engagement rises with more open / social choices; privacy rises with safer choices.
 */

const AUDIENCE_ENGAGEMENT = {
  Public: 100,
  Friends: 72,
  'Close Friends': 42,
  'Only Me': 8,
}

const AUDIENCE_PRIVACY = {
  Public: 12,
  Friends: 46,
  'Close Friends': 78,
  'Only Me': 100,
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * @param {object} draft — audience, locationTagOn, captionMode, captionText, photoOption
 * @param {object | null} levelConfig — level JSON (riskProfile for caption heuristics; photo ignores gold path)
 */
export function computeLiveMeters(draft, levelConfig) {
  if (!draft) {
    return { privacyPct: 50, engagementPct: 50 }
  }

  const aud = draft.audience
  const audienceEng = AUDIENCE_ENGAGEMENT[aud] ?? 52
  const audiencePriv = AUDIENCE_PRIVACY[aud] ?? 52

  const locOn = Boolean(draft.locationTagOn)
  const gold = levelConfig?.goldPathSummary ?? {}
  const wantsBroadLocationOn = gold.locationTagOn === true
  const wantsLocationOff = gold.locationTagOff === true
  let locPrivacy
  let locEngagement
  if (wantsBroadLocationOn) {
    locPrivacy = locOn ? 88 : 38
    locEngagement = locOn ? 62 : 48
  } else if (wantsLocationOff) {
    locPrivacy = locOn ? 30 : 96
    locEngagement = locOn ? 64 : 44
  } else {
    locPrivacy = locOn ? 55 : 78
    locEngagement = locOn ? 58 : 50
  }

  const dangerous = levelConfig?.riskProfile === 'dangerous'

  const captionTrim = (draft.captionText ?? '').trim()
  const hasCaption = captionTrim.length > 0

  let capPrivacy = 70
  let capEngagement = 58
  if (dangerous) {
    if (draft.captionMode === 'edit') {
      capPrivacy = hasCaption ? 84 : 72
      capEngagement = hasCaption ? 62 : 48
    } else {
      capPrivacy = 36
      capEngagement = 60
    }
  } else {
    if (draft.captionMode === 'edit') {
      capPrivacy = hasCaption ? 76 : 66
      capEngagement = hasCaption ? 70 : 54
    } else {
      capPrivacy = 74
      capEngagement = 66
    }
  }

  // Photo: any crop/blur (A or B) counts as taking a protective step—higher privacy,
  // lower engagement vs leaving the full original frame. We do not judge “correct” gold here.
  const photo = draft.photoOption ?? 'Original'
  const usedCropOrBlur = photo === 'Option A' || photo === 'Option B'
  const photoPrivacy = usedCropOrBlur ? 92 : 44
  const photoEngagement = usedCropOrBlur ? 54 : 86

  const privacyPct = Math.round(
    clamp(
      0.34 * audiencePriv +
        0.26 * locPrivacy +
        0.22 * capPrivacy +
        0.18 * photoPrivacy,
      0,
      100,
    ),
  )

  const engagementPct = Math.round(
    clamp(
      0.4 * audienceEng +
        0.18 * locEngagement +
        0.22 * capEngagement +
        0.2 * photoEngagement,
      0,
      100,
    ),
  )

  return { privacyPct, engagementPct }
}
