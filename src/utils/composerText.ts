import type { FormattedText } from '../types'

export function segmentsToText(text: FormattedText): string {
  return text.map((segment) => segment.text).join('')
}

/** Текст из поля ввода в сегменты. Пустой текст это пустой список, а не сегмент с пустой строкой. */
export function textToSegments(text: string): FormattedText {
  return text === '' ? [] : [{ text }]
}

export function isBlank(text: FormattedText): boolean {
  return segmentsToText(text).trim() === ''
}

/** Убирает пробелы и переводы строк в начале и в конце всего текста, оформление сегментов сохраняется. */
export function trimSegments(text: FormattedText): FormattedText {
  const segments = text.map((segment) => ({ ...segment }))

  for (const segment of segments) {
    segment.text = segment.text.trimStart()
    if (segment.text !== '') break
  }
  for (let index = segments.length - 1; index >= 0; index--) {
    const segment = segments[index]
    if (!segment) continue
    segment.text = segment.text.trimEnd()
    if (segment.text !== '') break
  }

  return segments.filter((segment) => segment.text !== '')
}
