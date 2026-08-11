/**
 * @typedef {Object} BackdropToken
 * @property {string}   preset          - Registry key ("castle-towers", "shire-hills", etc.)
 * @property {string[]} skyGradient     - 3-4 CSS color stops, top to bottom
 * @property {string}   [silhouetteColor] - Defaults "#050608"
 * @property {string}   [overlayEffect] - "stars" | "snow" | "mist" | "fireflies" | "none"
 * @property {string}   [overlayColor]  - Particle color, defaults "#ffffff"
 */

/**
 * @typedef {Object} ThemeSpec
 * @property {string}        bookId
 * @property {string}        title
 * @property {string}        author
 * @property {string}        tagline
 * @property {string}        accent         - CSS hex color
 * @property {string[]}      words          - 15-30 uppercase 5-letter answers
 * @property {BackdropToken} backdrop
 * @property {number}        schemaVersion  - Currently 1
 */

/**
 * @typedef {Omit<ThemeSpec, 'words'>} ThemeSummary
 */

const FIVE_UPPER = /^[A-Z]{5}$/

export function validateThemeSpec(obj) {
  const errors = []

  if (!obj || typeof obj !== 'object') return { valid: false, errors: ['not an object'] }
  if (typeof obj.bookId !== 'string' || !obj.bookId) errors.push('bookId required')
  if (typeof obj.title !== 'string' || !obj.title) errors.push('title required')
  if (typeof obj.author !== 'string' || !obj.author) errors.push('author required')
  if (typeof obj.tagline !== 'string') errors.push('tagline required')
  if (typeof obj.accent !== 'string' || !obj.accent.startsWith('#')) errors.push('accent must be a hex color')

  if (!Array.isArray(obj.words)) {
    errors.push('words must be an array')
  } else {
    if (obj.words.length < 15) errors.push(`need at least 15 words, got ${obj.words.length}`)
    const bad = obj.words.filter((w) => !FIVE_UPPER.test(w))
    if (bad.length) errors.push(`invalid words: ${bad.slice(0, 5).join(', ')}`)
  }

  if (!obj.backdrop || typeof obj.backdrop !== 'object') {
    errors.push('backdrop required')
  } else {
    if (typeof obj.backdrop.preset !== 'string') errors.push('backdrop.preset required')
    if (!Array.isArray(obj.backdrop.skyGradient) || obj.backdrop.skyGradient.length < 3) {
      errors.push('backdrop.skyGradient needs 3+ color stops')
    }
  }

  return { valid: errors.length === 0, errors }
}

export function toSummary(spec) {
  const { words: _, ...summary } = spec
  return summary
}
