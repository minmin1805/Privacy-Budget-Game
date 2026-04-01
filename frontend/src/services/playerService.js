import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const PLAYER_API_URL = `${API_BASE}/api/players`
const GRADE_CAPTION_URL = `${API_BASE}/api/privacy-budget/grade-caption`

const createPlayer = async (username) => {
    const response = await axios.post(PLAYER_API_URL, { username })

    if(response.status === 201) {
        return response.data
    }
    else {
        throw new Error('Failed to create player')
    }
}

const updatePlayer = async (playerId, playerData) => {
    const response = await axios.patch(`${PLAYER_API_URL}/${playerId}`, playerData)

    if(response.status === 200) {
        return response.data
    }

    else {
        throw new Error('Failed to update player')
    }
}

const getLeaderboard = async ({ limit = 4, mode } = {}) => {
    const response = await axios.get(`${PLAYER_API_URL}/leaderboard` , {
        params: {
            limit,
            ...(mode != null && mode !== '' ? { mode } : {}),
        }
    })

    if(response.status === 200) {
        return response.data
    }

    else {
        throw new Error('Failed to get leaderboard')
    }
}

const gradeCaption = async (body) => {
    const response = await axios.post(GRADE_CAPTION_URL, body)

    if(response.status === 200) {
        return response.data
    }

    else {
        throw new Error('Failed to grade caption')
    }
}

export { createPlayer, updatePlayer, getLeaderboard, gradeCaption }
