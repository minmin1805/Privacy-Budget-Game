/**
 * Level art under src/assets/LevelImage/level{N}/:
 *   image.png (profile), post.png, optiona.png, optionb.png
 * Level 7 may omit optionb.png (single edit option).
 */
const modules = import.meta.glob('../assets/LevelImage/**/*.png', {
  eager: true,
  import: 'default',
})

function fileStem(path) {
  const base = path.split('/').pop() || ''
  return base.replace(/\.png$/i, '').toLowerCase()
}

/** @param {number} levelId 1–10 */
export function getLevelAssets(levelId) {
  const folder = `level${levelId}`
  const byStem = {}

  for (const [path, url] of Object.entries(modules)) {
    if (!path.includes(`/LevelImage/${folder}/`)) continue
    byStem[fileStem(path)] = url
  }

  return {
    profile: byStem.image ?? null,
    post: byStem.post ?? null,
    optionA: byStem.optiona ?? null,
    optionB: byStem.optionb ?? null,
  }
}

/** True when only Option A exists (e.g. level 7). */
export function hasOnlyOptionA(levelId) {
  const { optionA, optionB } = getLevelAssets(levelId)
  return Boolean(optionA) && !optionB
}
