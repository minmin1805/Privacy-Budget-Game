import {
    PRIVACY_BUDGET_LEVEL_GOLD,
    PRIVACY_BUDGET_LEVEL_COUNT,
} from '../data/privacyBudgetLevelConfig.js';

const WEIGHT = {
    audience: 25,
    location: 25,
    caption: 25,
    photo: 25,
};

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
    if (!captionAi) return { captionQualityPoints: WEIGHT.caption, note: 'No AI data.' };
    const b = captionAi.band;
    if (b === 'safe') return { captionQualityPoints: WEIGHT.caption, note: 'Caption looks appropriately general.' };
    if (b === 'okay')
        return { captionQualityPoints: Math.round(WEIGHT.caption * 0.65), note: captionAi.reason || 'Caption could be tighter.' };
    return { captionQualityPoints: Math.round(WEIGHT.caption * 0.35), note: captionAi.reason || 'Caption may leak context.' };
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
        audiencePoints = WEIGHT.audience;
    } else if (audience === 'Public' && gold.audienceGold.includes('Friends')) {
        audiencePoints = 12;
    } else if (
        gold.audienceGold.includes('Friends') &&
        audience === 'Close Friends' &&
        gold.audienceGold.includes('Close Friends')
    ) {
        audiencePoints = WEIGHT.audience;
    } else {
        audiencePoints = Math.max(0, 8);
    }

    const locationPoints = gold.locationMustBeOff ? (!locationOn ? WEIGHT.location : 0) : WEIGHT.location;

    let captionPoints = 0;
    if (gold.captionRule === 'keep_or_edit') {
        if (captionMode === 'keep') {
            captionPoints = WEIGHT.caption;
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
        photoPoints = WEIGHT.photo;
    } else if (gold.photoPartial?.includes(photo)) {
        photoPoints = Math.round(WEIGHT.photo * 0.55);
    } else if (gold.riskProfile === 'safe' && (photo === 'Option A' || photo === 'Option B')) {
        photoPoints = 10;
    } else {
        photoPoints = gold.riskProfile === 'dangerous' && photo === 'Original' ? 5 : 8;
    }

    let basePoints = audiencePoints + locationPoints + captionPoints + photoPoints;
    let bonus = 0;
    let penalty = 0;

    if (basePoints >= 92 && gold.riskProfile === 'dangerous' && gold.photoGold.includes(photo)) {
        bonus = Math.min(5, 100 - basePoints);
    }
    if (audience === 'Public' && gold.locationMustBeOff && locationOn) {
        penalty += 8;
    }

    let levelScore = Math.max(0, Math.min(100, basePoints + bonus - penalty));

    let feedbackBand = 'okay';
    if (levelScore >= 80) feedbackBand = 'great';
    else if (levelScore >= 55) feedbackBand = 'okay';
    else feedbackBand = 'risky';

    const whatWorked = [];
    const tightenNextTime = [];

    if (audiencePoints >= WEIGHT.audience - 1) whatWorked.push('Audience choice matches a safer sharing level.');
    else tightenNextTime.push('Tighten who can see this (Friends, Close Friends, or Only Me when appropriate).');

    if (locationPoints >= WEIGHT.location - 1) whatWorked.push('Location tag is off when it should be.');
    else if (locationOn) tightenNextTime.push('Turn off the location tag to reduce where-and-when exposure.');

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

    const suggestedSetup = `Target for this level: ${gold.audienceGold.join(' or ')} audience, location off, ${
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
            weights: WEIGHT,
        },
    };
}

export function getPrivacyBudgetLevelCount() {
    return PRIVACY_BUDGET_LEVEL_COUNT;
}

export { PRIVACY_BUDGET_LEVEL_GOLD };
