#!/usr/bin/env node
/**
 * Privacy Budget — aggregate KPIs from the existing MongoDB `players` collection.
 *
 * Usage:
 *   node scripts/reports/privacyBudgetMetrics.mjs
 *   node scripts/reports/privacyBudgetMetrics.mjs --from 2026-01-01 --to 2026-04-30
 *   node scripts/reports/privacyBudgetMetrics.mjs --json   # stdout only JSON
 *
 * Requires MONGO_URI in project root `.env` (loads via dotenv from cwd).
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..', '..')
dotenv.config({ path: path.join(repoRoot, '.env') })

const playerModuleUrl = pathToFileURL(path.join(repoRoot, 'backend', 'models', 'Player.js')).href
const Player = (await import(playerModuleUrl)).default

function parseArgs() {
  const argv = process.argv.slice(2)
  const opts = { from: null, to: null, json: false, outfile: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--from') opts.from = argv[++i]
    else if (argv[i] === '--to') opts.to = argv[++i]
    else if (argv[i] === '--json') opts.json = true
    else if (argv[i] === '--out') opts.outfile = argv[++i]
  }
  return opts
}

/** @param {string|null} ymd */
function endOfDay(ymd) {
  if (!ymd) return null
  const d = new Date(`${ymd}T23:59:59.999Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** @param {string|null} ymd */
function startOfDay(ymd) {
  if (!ymd) return null
  const d = new Date(`${ymd}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function median(sortedNumbers) {
  if (!sortedNumbers.length) return null
  const mid = Math.floor(sortedNumbers.length / 2)
  if (sortedNumbers.length % 2) return sortedNumbers[mid]
  return (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2
}

function matchCreatedInRange(opts) {
  const s = startOfDay(opts.from)
  const e = endOfDay(opts.to)
  if (!s && !e) return {}
  const createdAt = {}
  if (s) createdAt.$gte = s
  if (e) createdAt.$lte = e
  return Object.keys(createdAt).length ? { createdAt } : {}
}

async function main() {
  const opts = parseArgs()
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('Missing MONGO_URI. Set it in .env at the project root.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const matchDate = matchCreatedInRange(opts)

  // --- KPI 1–3: starts, completes, completion rate ---
  const [rollup] = await Player.aggregate([
    { $match: matchDate },
    {
      $group: {
        _id: null,
        starts: { $sum: 1 },
        completes: {
          $sum: {
            $cond: [{ $ne: ['$privacyBudgetCompletedAt', null] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        starts: 1,
        completes: 1,
        completionRate: {
          $cond: [{ $gt: ['$starts', 0] }, { $divide: ['$completes', '$starts'] }, null],
        },
      },
    },
  ])

  const starts = rollup?.starts ?? 0
  const completes = rollup?.completes ?? 0
  const completionRate = rollup?.completionRate ?? null

  // --- KPI 4: avg + median score (completers only) ---
  const completerScores = await Player.find({
    ...matchDate,
    privacyBudgetCompletedAt: { $ne: null },
  })
    .select('privacyBudgetTotalScore')
    .lean()

  const scores = completerScores
    .map((p) => Number(p.privacyBudgetTotalScore) || 0)
    .sort((a, b) => a - b)
  const avgScoreAmongCompleters =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const medianScoreAmongCompleters = median(scores)

  // --- KPI 5: feedback band distribution (per level submission) ---
  const bandDist = await Player.aggregate([
    { $match: matchDate },
    { $unwind: { path: '$privacyBudgetLevelResults', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: {
          $ifNull: ['$privacyBudgetLevelResults.feedbackBand', ''],
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  const bandTotal = bandDist.reduce((s, b) => s + b.count, 0)
  const feedbackBandShare = Object.fromEntries(
    bandDist.map((b) => {
      const key = b._id === '' ? '(empty)' : String(b._id)
      return [key, bandTotal ? b.count / bandTotal : 0]
    }),
  )

  // --- KPI 6: funnel by max level reached (levelId in results) ---
  const funnel = await Player.aggregate([
    { $match: matchDate },
    {
      $addFields: {
        maxLevel: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ['$privacyBudgetLevelResults', []] } }, 0] },
            { $max: '$privacyBudgetLevelResults.levelId' },
            null,
          ],
        },
      },
    },
    {
      $facet: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => {
          const k = i + 1
          return [
            `reachedAtLeastLevel${k}`,
            [{ $match: { maxLevel: { $gte: k } } }, { $count: 'n' }],
          ]
        }),
      ),
    },
  ])

  const funnelRow = funnel[0] || {}
  const funnelCounts = {}
  for (let k = 1; k <= 10; k++) {
    const key = `reachedAtLeastLevel${k}`
    funnelCounts[`atLeastLevel${k}`] = funnelRow[key]?.[0]?.n ?? 0
  }
  const funnelShareOfStarts = {}
  for (let k = 1; k <= 10; k++) {
    funnelShareOfStarts[`pctAtLeastLevel${k}`] =
      starts > 0 ? funnelCounts[`atLeastLevel${k}`] / starts : null
  }

  // --- KPI 7: caption mode mix (per submission) ---
  const captionMix = await Player.aggregate([
    { $match: matchDate },
    { $unwind: { path: '$privacyBudgetLevelResults', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$privacyBudgetLevelResults.selectedCaptionMode',
        count: { $sum: 1 },
      },
    },
  ])
  const captionTotal = captionMix.reduce((s, c) => s + c.count, 0)
  const captionModeShare = Object.fromEntries(
    captionMix.map((c) => [String(c._id ?? 'unknown'), captionTotal ? c.count / captionTotal : 0]),
  )

  // --- Extra: session duration (completers), seconds ---
  const durationAgg = await Player.aggregate([
    {
      $match: {
        ...matchDate,
        privacyBudgetCompletedAt: { $ne: null },
      },
    },
    {
      $project: {
        durationSec: {
          $divide: [{ $subtract: ['$privacyBudgetCompletedAt', '$createdAt'] }, 1000],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgDurationSec: { $avg: '$durationSec' },
        durations: { $push: '$durationSec' },
      },
    },
  ])

  let medianDurationSec = null
  let avgDurationSec = null
  if (durationAgg[0]) {
    avgDurationSec = durationAgg[0].avgDurationSec
    const durs = (durationAgg[0].durations || [])
      .filter((x) => typeof x === 'number' && !Number.isNaN(x))
      .sort((a, b) => a - b)
    medianDurationSec = median(durs)
  }

  const out = {
    generatedAt: new Date().toISOString(),
    database: mongoose.connection.name,
    dateFilter: {
      from: opts.from ?? null,
      to: opts.to ?? null,
      appliedToField: 'createdAt (player document = one run / welcome session)',
    },
    kpi: {
      starts,
      completes,
      completionRate,
      completionRatePct: completionRate != null ? Math.round(completionRate * 10000) / 100 : null,
      avgPrivacyBudgetTotalScoreAmongCompleters: avgScoreAmongCompleters,
      medianPrivacyBudgetTotalScoreAmongCompleters: medianScoreAmongCompleters,
      feedbackBandDistribution: bandDist.map((b) => ({
        band: b._id === '' ? '(empty)' : b._id,
        count: b.count,
        shareOfSubmissions: bandTotal ? b.count / bandTotal : 0,
      })),
      funnelMaxLevel: { counts: funnelCounts, shareOfStarts: funnelShareOfStarts },
      captionModeShare,
      sessionDurationAmongCompletersSec: {
        avg: avgDurationSec,
        median: medianDurationSec,
      },
    },
    notes: [
      'One Player document ≈ one game run after welcome screen (nickname must be unique).',
      'Completion = privacyBudgetCompletedAt is set (10 levels cleared).',
    ],
  }

  if (!opts.json) {
    console.log('='.repeat(60))
    console.log('Privacy Budget — KPI report')
    console.log('='.repeat(60))
    console.log(JSON.stringify(out, null, 2))
  } else {
    console.log(JSON.stringify(out, null, 2))
  }

  const outPath =
    opts.outfile ||
    path.join(repoRoot, 'reports', `privacy-budget-metrics-${Date.now()}.json`)
  if (!opts.json) fs.mkdirSync(path.dirname(outPath), { recursive: true })
  if (!opts.json) {
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
    console.log('\nSaved:', outPath)
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
