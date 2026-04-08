import crypto from 'crypto';
import mongoose from 'mongoose';
import Player from '../models/Player.js';
import { gradeCaption } from '../services/captionGradingService.js';
import { scorePrivacyBudgetLevel } from '../services/privacyBudgetScoringService.js';

function isDuplicateKeyError(error) {
    return error && (error.code === 11000 || error.code === 11001);
}

export const createPlayer = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({ message: 'Username is required' });
        }

        const trimmedName = username.trim();

        const createSessionId = crypto.randomUUID();

        const createdPlayer = await Player.create({
            name: trimmedName,
            sessionId: createSessionId,
        });

        if (!createdPlayer) {
            return res.status(400).json({ message: 'Failed to create player' });
        }

        return res.status(201).json({
            id: createdPlayer._id.toString(),
            name: createdPlayer.name,
            sessionId: createdPlayer.sessionId,
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            const patternKeys = error.keyPattern ? Object.keys(error.keyPattern) : [];
            const valueKeys = error.keyValue && typeof error.keyValue === 'object' ? Object.keys(error.keyValue) : [];
            const dupFields = new Set([...patternKeys, ...valueKeys]);
            if (dupFields.has('name')) {
                return res.status(409).json({
                    message:
                        'That name is already in use. Please choose a different nickname and try again.',
                });
            }
            if (dupFields.has('sessionId')) {
                return res.status(503).json({
                    message: 'Could not start a new session. Please tap Begin again.',
                });
            }
        }
        console.error('[createPlayer]', error);
        return res.status(500).json({ error: error.message });
    }
};

function validatePrivacyBudgetSubmission(sub) {
    if (!sub || typeof sub !== 'object') return 'privacyBudgetLevelSubmission must be an object';
    const levelId = Number(sub.levelId);
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > 10) {
        return 'privacyBudgetLevelSubmission.levelId must be 1–10';
    }
    if (typeof sub.selectedAudience !== 'string' || !sub.selectedAudience.trim()) {
        return 'privacyBudgetLevelSubmission.selectedAudience is required';
    }
    if (typeof sub.selectedLocationTag !== 'boolean') {
        return 'privacyBudgetLevelSubmission.selectedLocationTag must be boolean';
    }
    if (sub.captionMode !== 'keep' && sub.captionMode !== 'edit') {
        return 'privacyBudgetLevelSubmission.captionMode must be "keep" or "edit"';
    }
    if (typeof sub.selectedCaption !== 'string') {
        return 'privacyBudgetLevelSubmission.selectedCaption must be a string';
    }
    const photo = sub.selectedPhotoOption;
    if (!['Original', 'Option A', 'Option B'].includes(photo)) {
        return 'privacyBudgetLevelSubmission.selectedPhotoOption must be Original | Option A | Option B';
    }
    return null;
}

export const updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            score,
            correctDecisions,
            badge,
            completeAt,
            privacyBudgetLevelSubmission,
            privacyBudgetSummary,
            privacyBudgetCurrentLevel: pbLevelOverride,
            privacyBudgetTotalScore: pbTotalOverride,
            privacyBudgetCompletedAt: pbCompletedOverride,
        } = req.body;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid player ID' });
        }

        const player = await Player.findById(id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const updateData = {};
        let lastPrivacyBudgetFeedback = null;

        if (typeof score === 'number') {
            updateData.score = score;
        }
        if (typeof correctDecisions === 'number') {
            updateData.correctDecisions = correctDecisions;
        }
        if (typeof badge === 'string' && badge.trim() !== '') {
            updateData.badge = badge;
        }
        if (completeAt) {
            const completedDate = new Date(completeAt);
            if (!Number.isNaN(completedDate.getTime())) {
                updateData.completeAt = completedDate;
            }
        }
        if (privacyBudgetSummary !== undefined && privacyBudgetSummary !== null && typeof privacyBudgetSummary === 'object') {
            updateData.privacyBudgetSummary = privacyBudgetSummary;
        }
        if (typeof pbLevelOverride === 'number' && pbLevelOverride >= 1 && pbLevelOverride <= 10) {
            updateData.privacyBudgetCurrentLevel = pbLevelOverride;
        }
        if (typeof pbTotalOverride === 'number' && pbTotalOverride >= 0) {
            updateData.privacyBudgetTotalScore = pbTotalOverride;
        }
        if (pbCompletedOverride) {
            const d = new Date(pbCompletedOverride);
            if (!Number.isNaN(d.getTime())) {
                updateData.privacyBudgetCompletedAt = d;
            }
        }

        if (privacyBudgetLevelSubmission) {
            const err = validatePrivacyBudgetSubmission(privacyBudgetLevelSubmission);
            if (err) {
                return res.status(400).json({ message: err });
            }

            if (player.privacyBudgetCompletedAt) {
                return res.status(400).json({ message: 'Privacy Budget already completed for this player.' });
            }

            const levelId = Number(privacyBudgetLevelSubmission.levelId);
            const completedCount = player.privacyBudgetLevelResults?.length || 0;
            const expectedLevelId = completedCount + 1;

            if (levelId !== expectedLevelId) {
                return res.status(400).json({
                    message: `Expected submission for level ${expectedLevelId}, got ${levelId}.`,
                });
            }

            let captionAi = null;
            if (privacyBudgetLevelSubmission.captionMode === 'edit') {
                captionAi = await gradeCaption(privacyBudgetLevelSubmission.selectedCaption || '', {
                    levelId,
                });
            }

            const scoring = scorePrivacyBudgetLevel(
                levelId,
                {
                    selectedAudience: privacyBudgetLevelSubmission.selectedAudience,
                    selectedLocationTag: privacyBudgetLevelSubmission.selectedLocationTag,
                    captionMode: privacyBudgetLevelSubmission.captionMode,
                    selectedCaption: privacyBudgetLevelSubmission.selectedCaption,
                    selectedPhotoOption: privacyBudgetLevelSubmission.selectedPhotoOption,
                },
                privacyBudgetLevelSubmission.captionMode === 'edit' ? captionAi : null,
            );

            const levelResult = {
                levelId,
                selectedAudience: privacyBudgetLevelSubmission.selectedAudience,
                selectedLocationTag: privacyBudgetLevelSubmission.selectedLocationTag,
                selectedCaptionMode: privacyBudgetLevelSubmission.captionMode,
                selectedCaption: privacyBudgetLevelSubmission.selectedCaption || '',
                selectedPhotoOption: privacyBudgetLevelSubmission.selectedPhotoOption,
                captionAiBand:
                    privacyBudgetLevelSubmission.captionMode === 'edit'
                        ? captionAi?.band || ''
                        : 'safe',
                captionAiReason:
                    privacyBudgetLevelSubmission.captionMode === 'edit'
                        ? captionAi?.reason || ''
                        : 'Caption kept as original.',
                levelScore: scoring.levelScore,
                feedbackBand: scoring.feedbackBand,
                scoreBreakdown: scoring.scoreBreakdown,
            };

            const newTotal = (player.privacyBudgetTotalScore || 0) + scoring.levelScore;
            const newLen = completedCount + 1;
            const justFinished = newLen >= 10;

            updateData.$push = { privacyBudgetLevelResults: levelResult };
            updateData.privacyBudgetTotalScore = newTotal;
            updateData.privacyBudgetCurrentLevel = justFinished ? 10 : newLen + 1;
            if (justFinished) {
                updateData.privacyBudgetCompletedAt = new Date();
                updateData.privacyBudgetSummary = {
                    totalScore: newTotal,
                    levelsCompleted: 10,
                    completedAt: new Date().toISOString(),
                };
            }

            lastPrivacyBudgetFeedback = {
                levelId,
                levelScore: scoring.levelScore,
                feedbackBand: scoring.feedbackBand,
                basePoints: scoring.basePoints,
                bonus: scoring.bonus,
                penalty: scoring.penalty,
                whatWorked: scoring.whatWorked,
                tightenNextTime: scoring.tightenNextTime,
                suggestedSetup: scoring.suggestedSetup,
                scoreBreakdown: scoring.scoreBreakdown,
                captionAi:
                    privacyBudgetLevelSubmission.captionMode === 'edit' && captionAi
                        ? {
                              band: captionAi.band,
                              reason: captionAi.reason,
                              verdict: captionAi.verdict,
                              risk_flags: captionAi.risk_flags,
                              suggested_caption: captionAi.suggested_caption,
                              source: captionAi.source,
                          }
                        : null,
            };
        }

        let updatedPlayer;

        if (privacyBudgetLevelSubmission) {
            const { $push, ...setPayload } = updateData;

            updatedPlayer = await Player.findByIdAndUpdate(
                id,
                {
                    ...(Object.keys(setPayload).length ? { $set: setPayload } : {}),
                    ...(updateData.$push ? { $push: updateData.$push } : {}),
                },
                { new: true, runValidators: true },
            );
        } else {
            updatedPlayer = await Player.findByIdAndUpdate(
                id,
                {
                    $set: updateData,
                },
                { new: true, runValidators: true },
            );
        }

        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const base = {
            id: updatedPlayer._id.toString(),
            name: updatedPlayer.name,
            score: updatedPlayer.score,
            correctDecisions: updatedPlayer.correctDecisions,
            badge: updatedPlayer.badge,
            completeAt: updatedPlayer.completeAt,
            privacyBudgetCurrentLevel: updatedPlayer.privacyBudgetCurrentLevel,
            privacyBudgetTotalScore: updatedPlayer.privacyBudgetTotalScore,
            privacyBudgetCompletedAt: updatedPlayer.privacyBudgetCompletedAt,
            privacyBudgetLevelResults: updatedPlayer.privacyBudgetLevelResults,
            privacyBudgetSummary: updatedPlayer.privacyBudgetSummary,
        };

        if (lastPrivacyBudgetFeedback) {
            base.lastPrivacyBudgetFeedback = lastPrivacyBudgetFeedback;
        }

        return res.status(200).json(base);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 4, 20);
        const mode = (req.query.mode || 'friend-or-foe').toLowerCase();
        const isPrivacyBudget =
            mode === 'privacy-budget' || mode === 'pb' || mode === 'privacybudget';

        if (isPrivacyBudget) {
            const foundPlayers = await Player.find({
                privacyBudgetCompletedAt: { $ne: null },
            })
                .sort({ privacyBudgetTotalScore: -1 })
                .limit(limit)
                .select('name privacyBudgetTotalScore privacyBudgetCompletedAt badge')
                .lean();

            return res.status(200).json(
                foundPlayers.map((p) => ({
                    name: p.name,
                    score: p.privacyBudgetTotalScore,
                    completeAt: p.privacyBudgetCompletedAt,
                    badge: p.badge,
                    mode: 'privacy-budget',
                })),
            );
        }

        const foundPlayers = await Player.find({
            completeAt: { $ne: null },
        })
            .sort({ score: -1 })
            .limit(limit)
            .select('name score completeAt badge')
            .lean();

        return res.status(200).json(
            foundPlayers.map((p) => ({
                ...p,
                mode: 'friend-or-foe',
            })),
        );
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
