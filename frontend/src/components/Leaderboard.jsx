import React from 'react'

const entries = [
  { rank: 1, name: 'Kai', score: 1840, badge: 'Privacy Pro' },
  { rank: 2, name: 'Aisha', score: 1720, badge: 'Risk Spotter' },
  { rank: 3, name: 'Noah', score: 1650, badge: 'Balanced Sharer' },
  { rank: 4, name: 'YOU', score: 1580, badge: 'Careful Poster' },
  { rank: 5, name: 'Mina', score: 1495, badge: 'Safety Builder' },
]

function getDisplayTitle(item) {
  return item.badge || 'Rising Player'
}

function Leaderboard() {



  return (
    <div className="w-full lg:flex-1 flex flex-col items-center">
    {/* Leaderboard card */}
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-[#ddecff] rounded-2xl p-3 flex flex-col items-center justify-center w-full">
        <div className="bg-white rounded-2xl flex flex-col w-full p-3">
          <div className="flex gap-3 items-center mb-4 border-b border-[#000000] pb-2">
            <h1 className="text-xl sm:text-2xl font-bold">
              LEADERBOARD – ALL TIME
            </h1>
          </div>

          {entries.map((item) => (
            <div
              key={item.rank}
              className="flex flex-col gap-2 py-1"
            >
              <div
                className="grid gap-4 items-center"
                style={{
                  gridTemplateColumns: "1.15fr 0.7fr 1.15fr",
                }}
              >
                <p className="text-base sm:text-lg">
                  {item.rank}.{" "}
                  {item.name == "YOU" ? "YOU" : item.name}
                </p>
                <p className="text-base sm:text-lg text-right tabular-nums">
                  {item.score.toLocaleString()} Points
                </p>
                <p className="text-base sm:text-lg text-right">
                  {getDisplayTitle(item)}
                </p>
              </div>
              <div className="h-0.5 bg-[#2e0f53] w-full mt-1 mb-1" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* What you learned + key takeaway row (mirrors LeaderBoard subcards) */}
    <div className="flex flex-col md:flex-row items-center justify-center w-full mt-5 gap-3 md:gap-4 ">
      {/* WHAT YOU LEARNED */}
      <div className="bg-[#ddecff] rounded-2xl p-2 w-full md:w-[55%] h-auto">
        <div className="bg-white rounded-2xl overflow-hidden w-full h-full">
          <div className="bg-[#017407] w-full h-[40px] p-2 flex items-center">
            <p className="text-white text-lg sm:text-xl font-bold">
              What You Learned
            </p>
          </div>
          <div className="flex flex-col p-3 gap-2 text-sm sm:text-base">
            <p>✔ Check multiple clues together</p>
            <p>✔ Verify photo and profile consistency</p>
            <p>✔ Spot pressure, DM traps, and off-app moves</p>
            <p>✔ Choose safety when unsure</p>
          </div>
        </div>
      </div>

      {/* KEY TAKEAWAY */}
      <div className="bg-[#ddecff] rounded-2xl p-2 w-full md:w-[40%]">
        <div className="bg-white rounded-2xl overflow-hidden w-full h-full">
          <div className="bg-[#1d4ed8] w-full h-[40px] p-2 flex items-center">
            <p className="text-white text-lg sm:text-xl font-bold">
              Key Takeaway
            </p>
          </div>
          <div className="flex flex-col gap-2 p-3 text-sm sm:text-base">
            <p>Use multiple signals together, not just one clue.</p>
            <p>New account + low mutuals = extra caution.</p>
            <p>Pushy DMs/off-app moves are major red flags.</p>
            <p>When unsure, verify first and protect yourself.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Leaderboard
