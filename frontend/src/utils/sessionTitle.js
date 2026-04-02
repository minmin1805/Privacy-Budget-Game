import privacyBudgetData from '../data/privacyBudgetLevels.json'

/** Design ceiling: 4 dimensions × 100 per level (tune when backend rubric is fixed). */
const POINTS_PER_LEVEL = 400

const levelCount = privacyBudgetData.levels?.length ?? 10
const maxRunScore = levelCount * POINTS_PER_LEVEL

/**
 * Endgame title from cumulative privacy-budget score only (ratio vs theoretical max).
 * Three bands: Privacy Pro (top), Smart Sharer (middle), Privacy Explorer (low).
 * @returns {{ title: string, blurb: string }}
 */
export function getSessionTitleFromScore(totalScore) {
  const s = Math.max(0, Number(totalScore) || 0)
  const ratio = maxRunScore > 0 ? s / maxRunScore : 0

  if (ratio >= 0.7) {
    return {
      title: 'Privacy Pro',
      blurb: 'Strong run—your choices added up across every scenario.',
    }
  }
  if (ratio >= 0.38) {
    return {
      title: 'Smart Sharer',
      blurb: 'Decent habits—there’s still room to tighten audience, location, caption, and photo.',
    }
  }
  return {
    title: 'Privacy Explorer',
    blurb: 'You’re still mapping what works—another run will sharpen your instincts.',
  }
}

export { maxRunScore as sessionMaxScore }
