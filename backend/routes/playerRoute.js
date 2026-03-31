import express from 'express';
import {createPlayer, getLeaderboard, updatePlayer} from "../controllers/playerController.js";

const router = express.Router();

router.post("/leaderboard", getLeaderboard);
router.post("/", createPlayer);
router.patch("/:id", updatePlayer);

export default router;