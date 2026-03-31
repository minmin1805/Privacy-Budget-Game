import express from 'express';
import { gradeCaptionOnly } from '../controllers/privacyBudgetController.js';

const router = express.Router();

router.post('/grade-caption', gradeCaptionOnly);

export default router;
