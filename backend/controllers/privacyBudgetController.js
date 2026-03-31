import { gradeCaption } from '../services/captionGradingService.js';

export const gradeCaptionOnly = async (req, res) => {
    try {
        const { caption, levelId } = req.body;

        if (caption === undefined || typeof caption !== 'string') {
            return res.status(400).json({ message: 'caption is required (string)' });
        }

        const level =
            levelId !== undefined && levelId !== null
                ? Number(levelId)
                : null;
        if (level !== null && (Number.isNaN(level) || level < 1 || level > 10)) {
            return res.status(400).json({ message: 'levelId must be between 1 and 10' });
        }

        const result = await gradeCaption(caption, { levelId: level });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
