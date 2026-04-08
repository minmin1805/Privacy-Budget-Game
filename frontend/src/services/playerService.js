import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const PLAYER_API_URL = `${API_BASE}/api/players`
const GRADE_CAPTION_URL = `${API_BASE}/api/privacy-budget/grade-caption`

function messageFromAxiosError(error) {
    if (!axios.isAxiosError(error) || !error.response) {
        return error?.message ?? 'Something went wrong.'
    }
    const data = error.response.data
    if (data && typeof data === 'object') {
        if (typeof data.message === 'string' && data.message.trim()) {
            return data.message
        }
        if (typeof data.error === 'string' && data.error.trim()) {
            return data.error
        }
    }
    return error.message
}

const createPlayer = async (username) => {
    try {
        const response = await axios.post(PLAYER_API_URL, { username })
        if (response.status === 201) {
            return response.data
        }
        throw new Error('Failed to create player')
    } catch (error) {
        throw new Error(messageFromAxiosError(error))
    }
}

const updatePlayer = async (playerId, playerData) => {
    try {
        const response = await axios.patch(`${PLAYER_API_URL}/${playerId}`, playerData)
        if (response.status === 200) {
            return response.data
        }
        throw new Error('Failed to update player')
    } catch (error) {
        throw new Error(messageFromAxiosError(error))
    }
}

const getLeaderboard = async ({ limit = 4, mode } = {}) => {
    try {
        const response = await axios.get(`${PLAYER_API_URL}/leaderboard`, {
            params: {
                limit,
                ...(mode != null && mode !== '' ? { mode } : {}),
            },
        })
        if (response.status === 200) {
            return response.data
        }
        throw new Error('Failed to get leaderboard')
    } catch (error) {
        throw new Error(messageFromAxiosError(error))
    }
}

const gradeCaption = async (body) => {
    try {
        const response = await axios.post(GRADE_CAPTION_URL, body)
        if (response.status === 200) {
            return response.data
        }
        throw new Error('Failed to grade caption')
    } catch (error) {
        throw new Error(messageFromAxiosError(error))
    }
}

export { createPlayer, updatePlayer, getLeaderboard, gradeCaption }
