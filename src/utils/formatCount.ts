/** Счётчик в компактной записи: `999`, `1,2K`, `15K`, `1,5M`. */
export function formatCount(count: number): string {
  if (count < 1000) return String(count)
  const [tenths, suffix] =
    count < 1_000_000 ? [Math.floor(count / 100), 'K'] : [Math.floor(count / 100_000), 'M']
  return `${String(tenths / 10).replace('.', ',')}${suffix}`
}
