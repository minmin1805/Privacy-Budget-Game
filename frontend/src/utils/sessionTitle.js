import privacyBudgetData from '../data/privacyBudgetLevels.json'

/** Design ceiling: 4 dimensions × 100 per level (tune when backend rubric is fixed). */
const POINTS_PER_LEVEL = 400

const levelCount = privacyBudgetData.levels?.length ?? 10
const maxRunScore = levelCount * POINTS_PER_LEVEL

/**
 * Endgame title from cumulative privacy-budget score only (ratio vs theoretical max).
 * @returns {{ title: string, blurb: string }}
 */
export function getSessionTitleFromScore(totalScore) {
  const s = Math.max(0, Number(totalScore) || 0)
  const ratio = maxRunScore > 0 ? s / maxRunScore : 0

  if (ratio >= 0.88) {
    return {
      title: 'Privacy Ace',
      blurb: 'You stacked strong habits across the run.',
    }
  }
  if (ratio >= 0.68) {
    return {
      title: 'Sharp Sharer',
      blurb: 'Solid instincts—keep refining the details.',
    }
  }
  if (ratio >= 0.42) {
    return {
      title: 'Steady Learner',
      blurb: 'You’re building the muscle—one choice at a time.',
    }
  }
  return {
    title: 'First Steps',
    blurb: 'Every scenario is practice—run it again anytime.',
  }
}

export { maxRunScore as sessionMaxScore }
