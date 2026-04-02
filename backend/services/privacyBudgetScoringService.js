import {
    PRIVACY_BUDGET_LEVEL_GOLD,
    PRIVACY_BUDGET_LEVEL_COUNT,
} from '../data/privacyBudgetLevelConfig.js';

/** Max points per setting (audience, location, caption, photo) — full run ceiling = 10 × 400. */
const POINTS_PER_SETTING = 100;

/** @param {string} a */
function normAudience(a) {
    if (!a || typeof a !== 'string') return '';
    const t = a.trim();
    const map = {
        public: 'Public',
        friends: 'Friends',
        'close friends': 'Close Friends',
        'only me': 'Only Me',
    };
    const lower = t.toLowerCase();
    if (map[lower]) return map[lower];
    if (['Public', 'Friends', 'Close Friends', 'Only Me'].includes(t)) return t;
    return t;
}

/** @param {string} p */
function normPhoto(p) {
    if (!p || typeof p !== 'string') return '';
    const t = p.trim();
    if (['Original', 'Option A', 'Option B'].includes(t)) return t;
    return t;
}

/**
 * @param {object} captionAi — from gradeCaption (band, reason, …)
 */
function bandFromCaptionAi(captionAi) {
    if (!captionAi) return { captionQualityPoints: POINTS_PER_SETTING, note: 'No AI data.' };
    const b = captionAi.band;
    if (b === 'safe') return { captionQualityPoints: POINTS_PER_SETTING, note: 'Caption looks appropriately general.' };
    if (b === 'okay')
        return { captionQualityPoints: 65, note: captionAi.reason || 'Caption could be tighter.' };
    return { captionQualityPoints: 35, note: captionAi.reason || 'Caption may leak context.' };
}

/**
 * @param {number} levelId
 * @param {object} submission
 * @param {string} submission.selectedAudience
 * @param {boolean} submission.selectedLocationTag — true = tag on
 * @param {'keep'|'edit'} submission.captionMode
 * @param {string} submission.selectedCaption
 * @param {'Original'|'Option A'|'Option B'} submission.selectedPhotoOption
 * @param {object|null} captionAi — output when captionMode is edit
 */
export function scorePrivacyBudgetLevel(levelId, submission, captionAi) {
    const gold = PRIVACY_BUDGET_LEVEL_GOLD[levelId];
    if (!gold) {
        return {
            levelScore: 0,
            basePoints: 0,
            bonus: 0,
            penalty: 0,
            feedbackBand: 'risky',
            whatWorked: [],
            tightenNextTime: ['Invalid level.'],
            suggestedSetup: null,
            scoreBreakdown: { error: 'unknown_level' },
        };
    }

    const audience = normAudience(submission.selectedAudience);
    const locationOn = !!submission.selectedLocationTag;
    const captionMode = submission.captionMode === 'edit' ? 'edit' : 'keep';
    const photo = normPhoto(submission.selectedPhotoOption);

    let audiencePoints = 0;
    if (gold.audienceGold.includes(audience)) {
        audiencePoints = POINTS_PER_SETTING;
    } else if (audience === 'Public' && gold.audienceGold.includes('Friends')) {
        audiencePoints = 48;
    } else if (
        gold.audienceGold.includes('Friends') &&
        audience === 'Close Friends' &&
        gold.audienceGold.includes('Close Friends')
    ) {
        audiencePoints = POINTS_PER_SETTING;
    } else {
        audiencePoints = Math.max(0, 32);
    }

    let locationPoints = 0;
    if (gold.locationMustBeOn) {
        locationPoints = locationOn ? POINTS_PER_SETTING : 0;
    } else if (gold.locationMustBeOff) {
        locationPoints = !locationOn ? POINTS_PER_SETTING : 0;
    } else {
        locationPoints = POINTS_PER_SETTING;
    }

    let captionPoints = 0;
    if (gold.captionRule === 'keep_or_edit') {
        if (captionMode === 'keep') {
            captionPoints = POINTS_PER_SETTING;
        } else {
            const { captionQualityPoints } = bandFromCaptionAi(captionAi);
            captionPoints = captionQualityPoints;
        }
    } else if (gold.captionRule === 'edit') {
        if (captionMode === 'edit') {
            const { captionQualityPoints } = bandFromCaptionAi(captionAi);
            captionPoints = captionQualityPoints;
        } else {
            captionPoints = 0;
        }
    }

    let photoPoints = 0;
    if (gold.photoGold.includes(photo)) {
        photoPoints = POINTS_PER_SETTING;
    } else if (gold.photoPartial?.includes(photo)) {
        photoPoints = 55;
    } else if (gold.riskProfile === 'safe' && (photo === 'Option A' || photo === 'Option B')) {
        photoPoints = 40;
    } else {
        photoPoints = gold.riskProfile === 'dangerous' && photo === 'Original' ? 20 : 32;
    }

    let basePoints = audiencePoints + locationPoints + captionPoints + photoPoints;
    let bonus = 0;
    let penalty = 0;

    if (basePoints >= 368 && gold.riskProfile === 'dangerous' && gold.photoGold.includes(photo)) {
        bonus = Math.min(20, 400 - basePoints);
    }
    if (audience === 'Public' && gold.locationMustBeOff && locationOn) {
        penalty += 32;
    }
    if (audience === 'Public' && gold.locationMustBeOn && !locationOn) {
        penalty += 20;
    }

    let levelScore = Math.max(0, Math.min(400, basePoints + bonus - penalty));

    let feedbackBand = 'okay';
    if (levelScore >= 320) feedbackBand = 'great';
    else if (levelScore >= 220) feedbackBand = 'okay';
    else feedbackBand = 'risky';

    const whatWorked = [];
    const tightenNextTime = [];

    if (audiencePoints >= POINTS_PER_SETTING - 1) whatWorked.push('Audience choice matches a safer sharing level.');
    else tightenNextTime.push('Tighten who can see this (Friends, Close Friends, or Only Me when appropriate).');

    if (gold.locationMustBeOn) {
        if (locationPoints >= POINTS_PER_SETTING - 1) {
            whatWorked.push('Broad location tag on—appropriate for this scenario.');
        } else {
            tightenNextTime.push('Use a broad city/region tag (on), not your exact address or venue pin.');
        }
    } else if (gold.locationMustBeOff) {
        if (locationPoints >= POINTS_PER_SETTING - 1) {
            whatWorked.push('Location tag is off when it should be.');
        } else if (locationOn) {
            tightenNextTime.push('Turn off the location tag to reduce where-and-when exposure.');
        }
    }

    if (gold.captionRule === 'keep_or_edit') {
        if (captionMode === 'keep') {
            whatWorked.push('Caption kept simple—appropriate for this scenario.');
        } else if (captionAi?.band === 'safe') {
            whatWorked.push('Edited caption stays general.');
        } else {
            tightenNextTime.push(captionAi?.reason || 'Simplify caption to avoid place, time, or identity cues.');
        }
    } else if (gold.captionRule === 'edit' && captionMode === 'edit') {
        if (captionAi?.band === 'safe') whatWorked.push('Edited caption stays general.');
        else tightenNextTime.push(captionAi?.reason || 'Simplify caption to avoid place, time, or identity cues.');
    } else if (gold.captionRule === 'edit' && captionMode === 'keep') {
        tightenNextTime.push('Editing the caption would reduce identifying details.');
    }

    if (gold.photoGold.includes(photo)) whatWorked.push('Photo choice matches the best balance for this scenario.');
    else if (gold.photoPartial?.includes(photo)) whatWorked.push('Photo edit helps; a stronger crop/blur could score higher.');
    else if (gold.riskProfile === 'safe') tightenNextTime.push('On this level, the original photo was enough—extra edits were unnecessary.');
    else tightenNextTime.push('Pick the crop/blur option that hides banners, plates, or faces in the risk zones.');

    const locHint = gold.locationMustBeOn
        ? 'broad location tag on (city/region)'
        : gold.locationMustBeOff
          ? 'location off'
          : 'location as appropriate';
    const suggestedSetup = `Target for this level: ${gold.audienceGold.join(' or ')} audience, ${locHint}, ${
        gold.captionRule === 'keep_or_edit' ? 'caption kept simple or edited' : 'edited caption'
    }, photo: ${gold.photoGold.join(' or ')}.`;

    return {
        levelScore,
        basePoints,
        bonus,
        penalty,
        feedbackBand,
        whatWorked: whatWorked.length ? whatWorked : ['Review settings for next time.'],
        tightenNextTime: tightenNextTime.length ? tightenNextTime : ['Keep balancing audience, location, caption, and image.'],
        suggestedSetup,
        scoreBreakdown: {
            audiencePoints,
            locationPoints,
            captionPoints,
            photoPoints,
            pointsPerSetting: POINTS_PER_SETTING,
            maxLevelScore: POINTS_PER_SETTING * 4,
        },
    };
}

export function getPrivacyBudgetLevelCount() {
    return PRIVACY_BUDGET_LEVEL_COUNT;
}

export { PRIVACY_BUDGET_LEVEL_GOLD };
