export const AVATAR_COLOR_COUNT = 6

const firstLetter = (word: string | undefined) => Array.from(word ?? '')[0] ?? ''

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  const first = firstLetter(words[0])
  if (!first) return '?'
  const last = words.length > 1 ? firstLetter(words[words.length - 1]) : ''
  return (first + last).toUpperCase()
}

export function getColorIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  return (Math.abs(hash) % AVATAR_COLOR_COUNT) + 1
}
