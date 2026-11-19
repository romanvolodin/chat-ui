/** Форма слова для числа: `[1 минуту, 2 минуты, 5 минут]`. */
export function pluralize(count: number, forms: readonly [string, string, string]): string {
  const lastTwo = Math.abs(count) % 100
  const last = lastTwo % 10
  if (lastTwo > 10 && lastTwo < 20) return forms[2]
  if (last === 1) return forms[0]
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}
