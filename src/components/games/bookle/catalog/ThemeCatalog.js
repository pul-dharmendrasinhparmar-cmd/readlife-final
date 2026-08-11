import { toSummary } from '../game/themeSpec'

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return hash >>> 0
}

function getDailySeeds(bookId, dateStr, count) {
  const base = hashCode(bookId + ':' + dateStr)
  const seeds = []
  for (let i = 0; i < count; i++) {
    seeds.push(hashCode(base + ':' + i + ''))
  }
  return seeds
}

export function createStaticCatalog(themes) {
  const map = new Map(themes.map((t) => [t.bookId, t]))

  return {
    listThemes() {
      return Promise.resolve(themes.map(toSummary))
    },

    getTheme(bookId) {
      const theme = map.get(bookId)
      return Promise.resolve(theme || null)
    },

    getDailyAnswers(bookId, date) {
      const theme = map.get(bookId)
      if (!theme) return Promise.resolve([])
      const dateStr =
        typeof date === 'string' ? date : date.toISOString().slice(0, 10)
      const seeds = getDailySeeds(bookId, dateStr, 3)
      const answers = seeds.map(
        (seed) => theme.words[seed % theme.words.length]
      )
      return Promise.resolve(answers)
    },
  }
}
