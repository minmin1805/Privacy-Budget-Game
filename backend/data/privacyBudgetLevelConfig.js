/**
 * Gold paths from docs/PRIVACY_BUDGET_BUILD_PLAN.md §7.
 * Audience values must match UI: Public | Friends | Close Friends | Only Me
 * Photo: Original | Option A | Option B
 */

/** @typedef {'Public'|'Friends'|'Close Friends'|'Only Me'} Audience */
/** @typedef {'Original'|'Option A'|'Option B'} PhotoOption */

/**
 * @typedef {Object} LevelGold
 * @property {Audience[]} audienceGold
 * @property {boolean} locationMustBeOff — full points when location tag is off (precise leaks)
 * @property {boolean} [locationMustBeOn] — full points when tag is on (broad city/region only; mutually exclusive with locationMustBeOff)
 * @property {'edit'|'keep_or_edit'} captionRule
 * @property {PhotoOption[]} photoGold
 * @property {PhotoOption[]} [photoPartial]
 * @property {'dangerous'|'safe'} riskProfile
 */

/** @type {Record<number, LevelGold>} */
export const PRIVACY_BUDGET_LEVEL_GOLD = {
    1: {
        audienceGold: ['Friends'],
        locationMustBeOff: true,
        captionRule: 'edit',
        photoGold: ['Option B'],
        photoPartial: ['Option A'],
        riskProfile: 'dangerous',
    },
    2: {
        audienceGold: ['Friends'],
        locationMustBeOff: false,
        locationMustBeOn: true,
        captionRule: 'edit',
        photoGold: ['Option A'],
        riskProfile: 'dangerous',
    },
    3: {
        audienceGold: ['Friends', 'Close Friends'],
        locationMustBeOff: false,
        locationMustBeOn: true,
        captionRule: 'keep_or_edit',
        photoGold: ['Option A'],
        riskProfile: 'dangerous',
    },
    4: {
        audienceGold: ['Close Friends'],
        locationMustBeOff: true,
        captionRule: 'edit',
        photoGold: ['Option B'],
        riskProfile: 'dangerous',
    },
    5: {
        audienceGold: ['Friends'],
        locationMustBeOff: false,
        locationMustBeOn: true,
        captionRule: 'keep_or_edit',
        photoGold: ['Original'],
        riskProfile: 'safe',
    },
    6: {
        audienceGold: ['Close Friends', 'Friends'],
        locationMustBeOff: true,
        captionRule: 'edit',
        photoGold: ['Original'],
        riskProfile: 'safe',
    },
    7: {
        audienceGold: ['Friends'],
        locationMustBeOff: false,
        locationMustBeOn: true,
        captionRule: 'keep_or_edit',
        photoGold: ['Original'],
        riskProfile: 'safe',
    },
    8: {
        audienceGold: ['Close Friends'],
        locationMustBeOff: true,
        captionRule: 'edit',
        photoGold: ['Option B'],
        riskProfile: 'dangerous',
    },
    9: {
        audienceGold: ['Friends', 'Close Friends'],
        locationMustBeOff: false,
        locationMustBeOn: true,
        captionRule: 'edit',
        photoGold: ['Option A'],
        riskProfile: 'dangerous',
    },
    10: {
        audienceGold: ['Close Friends'],
        locationMustBeOff: false,
        locationMustBeOn: true,
        captionRule: 'edit',
        photoGold: ['Option A'],
        riskProfile: 'dangerous',
    },
};

export const PRIVACY_BUDGET_LEVEL_COUNT = 10;
