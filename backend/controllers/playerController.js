import crypto from 'crypto';
import mongoose from 'mongoose';
import Player from '../models/Player.js';

export const createPlayer = async (req, res) => {
    try {
        const {username} = req.body;

        if(!username || typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({message: 'Username is required'});
        }

        const createSessionId = crypto.randomUUID();

        const createdPlayer = await Player.create({
            name: username,
            sessionId: createSessionId
        })

        if(!createdPlayer) {
            return res.status(400).json({message: 'Failed to create player'});
        }

        return res.status(201).json({
            id: createdPlayer._id.toString(),
            name: createdPlayer.name,
            sessionId: createdPlayer.sessionId,
        })
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

export const updatePlayer = async (req, res) => {
    try {
        const {id} = req.params;

        const {score, correctDecisions, badge, completeAt} = req.body;

        if(!id || mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: 'Invalid player ID'});
        }

        const updateData = {}

        if(typeof score === 'number') {
            updateData.score = score;
        }

        if(typeof correctDecisions === 'number') {
            updateData.correctDecisions = correctDecisions;
        }

        if(typeof badge === 'string' && badge.trim() !== '') {
            updateData.badge = badge;
        }

        if(completeAt) {
            const completedDate = new Date(completeAt);
            if(!Number.isNaN(completedDate.getTime())) {
                updateData.completeAt = completedDate;
            }
        }

        const updatedPlayer = await Player.findByIdAndUpdate(
            id, {
                $set: updateData,
            },
            {new: true, runValidators: true},
        );

        if(!updatedPlayer) {
            return res.status(404).json({message: 'Player not found'});
        }
        
        return res.status(200).json({
            id: updatedPlayer._id.toString(),
            name: updatedPlayer.name,
            score: updatedPlayer.score,
            correctDecisions: updatedPlayer.correctDecisions,
            badge: updatedPlayer.badge,
            completeAt: updatedPlayer.completeAt,
        })

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

export const getLeaderboard = async (req, res) => {

    try {
        
        const limit = Math.min(parseInt(req.query.limit) || 4, 20);

        const foundPlayers = await Player.find({
            completeAt: {$ne: null}
        })
        .sort({score: -1})
        .limit(limit)
        .select('name score completeAt badge')
        .lean();

        res.status(200).json(foundPlayers);

    } catch (error) {
        return res.status(500).json({error: error.message});
    }

}

