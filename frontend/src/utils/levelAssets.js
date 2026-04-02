/**
 * Level art — two supported layouts:
 *
 * 1) Vite-imported files under either:
 *    - src/assets/LevelImage/level{1–10}/
 *    - src/assets/Photo/GamePage/LevelImage/level{1–10}/  (common in this repo)
 *    Extensions: .png .webp .jpg .jpeg
 *    Names: image.png or profile.png (avatar), post.png, optiona.png, optionb.png.
 *    Level 7: only optiona.png is OK. Folder may be level7 or level07.
 *    Photo/GamePage paths are merged after LevelImage so same filenames override.
 *
 * 2) Fallback: public/ URLs from privacyBudgetLevels.json imageAsset.
 */

const globModules = Object.assign(
  {},
  import.meta.glob('../assets/LevelImage/**/*.png', { eager: true, import: 'default' }),
  import.meta.glob('../assets/LevelImage/**/*.webp', { eager: true, import: 'default' }),
  import.meta.glob('../assets/LevelImage/**/*.jpg', { eager: true, import: 'default' }),
  import.meta.glob('../assets/LevelImage/**/*.jpeg', { eager: true, import: 'default' }),
  import.meta.glob('../assets/Photo/GamePage/LevelImage/**/*.png', { eager: true, import: 'default' }),
  import.meta.glob('../assets/Photo/GamePage/LevelImage/**/*.webp', { eager: true, import: 'default' }),
  import.meta.glob('../assets/Photo/GamePage/LevelImage/**/*.jpg', { eager: true, import: 'default' }),
  import.meta.glob('../assets/Photo/GamePage/LevelImage/**/*.jpeg', { eager: true, import: 'default' }),
)

/** @param {string} path */
function fileStem(path) {
  const base = path.split('/').pop() || ''
  return base.replace(/\.(png|webp|jpe?g)$/i, '').toLowerCase()
}

/**
 * @param {Record<string, string>} byStem
 * @returns {{ profile: string | null, post: string | null, optionA: string | null, optionB: string | null }}
 */
function stemsToAssets(byStem) {
  const optionA =
    byStem.optiona ?? byStem['option-a'] ?? byStem.option_a ?? byStem.cropa ?? byStem['crop-a'] ?? null
  const optionB =
    byStem.optionb ?? byStem['option-b'] ?? byStem.option_b ?? byStem.cropb ?? byStem['crop-b'] ?? null

  return {
    profile: byStem.image ?? byStem.profile ?? byStem.avatar ?? null,
    post: byStem.post ?? byStem.original ?? null,
    optionA,
    optionB,
  }
}

/** Normalize glob keys (Windows may use `\`; Vite usually uses `/`). */
function normPath(p) {
  return String(p).replace(/\\/g, '/')
}

/** Folders: `level1` … `level10` (also accept `level01` … if present). */
function folderVariantsForLevel(levelId) {
  const n = Number(levelId)
  if (!Number.isFinite(n) || n < 1) return []
  return [`level${n}`, `level${String(n).padStart(2, '0')}`]
}

/** @param {number} levelId 1–10 */
function getLevelAssetsFromGlob(levelId) {
  const folders = folderVariantsForLevel(levelId)
  const byStem = {}

  for (const [rawPath, url] of Object.entries(globModules)) {
    const path = normPath(rawPath)
    const inLevel = folders.some((f) => path.includes(`/LevelImage/${f}/`))
    if (!inLevel) continue
    byStem[fileStem(path)] = url
  }

  return stemsToAssets(byStem)
}

/**
 * @param {object | null | undefined} levelConfig — level from privacyBudgetLevels.json
 */
function getAssetsFromJsonPaths(levelConfig) {
  const ia = levelConfig?.imageAsset
  if (!ia || typeof ia !== 'object') {
    return { profile: null, post: null, optionA: null, optionB: null }
  }

  const post = ia.srcOriginal ?? null
  return {
    profile: ia.srcProfile ?? post,
    post,
    optionA: ia.srcOptionA ?? null,
    optionB: ia.srcOptionB ?? null,
  }
}

/**
 * Prefer files in src/assets/LevelImage; fall back to JSON imageAsset URLs (public/).
 * @param {number} levelId
 * @param {object | null | undefined} levelConfig
 */
export function getMergedLevelAssets(levelId, levelConfig) {
  const fromGlob = getLevelAssetsFromGlob(levelId)
  const fromPaths = getAssetsFromJsonPaths(levelConfig)

  // If the folder has optiona.png but no optionb.png, do not fall back to JSON for B (level 7 single edit).
  const omitJsonOptionB = Boolean(fromGlob.optionA) && !fromGlob.optionB

  return {
    profile: fromGlob.profile ?? fromPaths.profile ?? null,
    post: fromGlob.post ?? fromPaths.post ?? null,
    optionA: fromGlob.optionA ?? fromPaths.optionA ?? null,
    optionB: omitJsonOptionB ? null : (fromGlob.optionB ?? fromPaths.optionB ?? null),
  }
}

/** @deprecated use getMergedLevelAssets(levelId, levelConfig) */
export function getLevelAssets(levelId) {
  return getLevelAssetsFromGlob(levelId)
}

/**
 * True when only Option A exists (e.g. level 7).
 * @param {number} levelId
 * @param {object | null | undefined} [levelConfig] — pass for correct JSON fallback
 */
export function hasOnlyOptionA(levelId, levelConfig) {
  const { optionA, optionB } = getMergedLevelAssets(levelId, levelConfig)
  return Boolean(optionA) && !optionB
}
