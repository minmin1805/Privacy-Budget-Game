import mongoose from 'mongoose';

const privacyBudgetLevelResultSchema = new mongoose.Schema(
    {
        levelId: { type: Number, required: true, min: 1, max: 10 },
        selectedAudience: { type: String, required: true },
        selectedLocationTag: { type: Boolean, required: true },
        selectedCaptionMode: { type: String, enum: ['keep', 'edit'], required: true },
        selectedCaption: { type: String, default: '' },
        selectedPhotoOption: {
            type: String,
            enum: ['Original', 'Option A', 'Option B'],
            required: true,
        },
        captionAiBand: { type: String, default: '' },
        captionAiReason: { type: String, default: '' },
        levelScore: { type: Number, required: true },
        feedbackBand: { type: String, required: true },
        scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { _id: false },
);

const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        sessionId: {
            type: String,
            required: true,
            unique: true,
        },
        score: {
            type: Number,
            default: 0,
        },
        correctDecisions: {
            type: Number,
            default: 0,
        },
        badge: {
            type: String,
            default: '',
            trim: true,
        },
        completeAt: {
            type: Date,
            default: null,
        },
        privacyBudgetCurrentLevel: {
            type: Number,
            default: null,
            min: 1,
            max: 10,
        },
        privacyBudgetTotalScore: {
            type: Number,
            default: 0,
        },
        privacyBudgetCompletedAt: {
            type: Date,
            default: null,
        },
        privacyBudgetLevelResults: {
            type: [privacyBudgetLevelResultSchema],
            default: [],
        },
        privacyBudgetSummary: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    { timestamps: true },
);

const Player = mongoose.model('Player', playerSchema);

export default Player;
