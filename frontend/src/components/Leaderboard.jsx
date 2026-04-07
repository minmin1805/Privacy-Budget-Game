import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../services/playerService'
import { getSessionTitleFromScore } from '../utils/sessionTitle'

function rowTitle(item) {
  if (item.badge && String(item.badge).trim()) return item.badge
  if (typeof item.score === 'number') return getSessionTitleFromScore(item.score).title
  return '—'
}

function Leaderboard({ currentPlayerName }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const normalizedSelf =
    currentPlayerName != null ? String(currentPlayerName).trim().toLowerCase() : ''

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getLeaderboard({ limit: 10, mode: 'privacy-budget' })
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        setEntries(
          list.map((p, i) => ({
            rank: i + 1,
            name: p.name ?? 'Player',
            score: typeof p.score === 'number' ? p.score : 0,
            badge: p.badge,
            mode: p.mode,
          })),
        )
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Could not load leaderboard.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='w-full lg:flex-1 flex flex-col items-center'>
      <div className='flex flex-col items-center justify-center w-full'>
        <div className='bg-[#ddecff] rounded-2xl p-3 flex flex-col items-center justify-center w-full'>
          <div className='bg-white rounded-2xl flex flex-col w-full p-3'>
            <div className='flex gap-3 items-center mb-4 border-b border-[#000000] pb-2'>
              <h1 className='text-base sm:text-xl md:text-2xl font-bold leading-tight'>
                LEADERBOARD – PRIVACY BUDGET
              </h1>
            </div>

            {loading ? (
              <p className='text-center text-[#334684] py-6'>Loading leaderboard…</p>
            ) : error ? (
              <p className='text-center text-red-700 py-4 text-sm'>{error}</p>
            ) : entries.length === 0 ? (
              <p className='text-center text-[#334684] py-6'>No completed runs yet. Be the first.</p>
            ) : (
              entries.map((item) => {
                const isYou =
                  normalizedSelf &&
                  String(item.name).trim().toLowerCase() === normalizedSelf
                return (
                  <div key={`${item.rank}-${item.name}`} className='flex flex-col gap-2 py-1'>
                    <div
                      className={`grid grid-cols-1 gap-1.5 sm:grid-cols-[1.15fr_0.7fr_1.15fr] sm:gap-4 sm:items-center rounded-lg px-2 py-2 sm:px-1 sm:py-1 -mx-1 ${
                        isYou ? 'bg-[#e0e9ff] ring-2 ring-[#4860bd]' : ''
                      }`}
                    >
                      <p className='text-sm sm:text-base md:text-lg break-words'>
                        {item.rank}. {item.name}
                        {isYou ? (
                          <span className='ml-2 text-xs sm:text-sm font-bold text-[#1d4ed8]'>(you)</span>
                        ) : null}
                      </p>
                      <p className='text-sm sm:text-base md:text-lg sm:text-right tabular-nums font-medium'>
                        {item.score.toLocaleString()} pts
                      </p>
                      <p className='text-xs sm:text-base md:text-lg sm:text-right text-[#334684] break-words'>
                        {rowTitle(item)}
                      </p>
                    </div>
                    <div className='h-0.5 bg-[#2e0f53] w-full mt-1 mb-1' />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className='flex flex-col md:flex-row items-center justify-center w-full mt-5 gap-3 md:gap-4 '>
        <div className='bg-[#ddecff] rounded-2xl p-2 w-full md:w-[55%] h-auto'>
          <div className='bg-white rounded-2xl overflow-hidden w-full h-full'>
            <div className='bg-[#017407] w-full h-[40px] p-2 flex items-center'>
              <p className='text-white text-lg sm:text-xl font-bold'>What You Learned</p>
            </div>
            <div className='flex flex-col p-3 gap-2 text-sm sm:text-base'>
              <p>✔ Privacy comes from multiple choices together.</p>
              <p>✔ Audience, caption, location, and photo all affect exposure.</p>
              <p>✔ The best setup depends on the scenario goal</p>
              <p>✔ You learned to pick a strong balance, not just max privacy.</p>
            </div>
          </div>
        </div>

        <div className='bg-[#ddecff] rounded-2xl p-2 w-full md:w-[40%]'>
          <div className='bg-white rounded-2xl overflow-hidden w-full h-full'>
            <div className='bg-[#1d4ed8] w-full h-[40px] p-2 flex items-center'>
              <p className='text-white text-lg sm:text-xl font-bold'>Key Takeaway</p>
            </div>
            <div className='flex flex-col gap-2 p-3 text-sm sm:text-base'>
              <p>Don’t rely on one setting—tune the whole post.</p>
              <p>Choose privacy that fits the moment and audience.</p>
              <p>Reduce risky details, but keep enough context.</p>
              <p>When posting, ask: who sees it and what can they tell?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
