import type { TextFormat } from '../types'

// Снаружи блоки, дальше обёртки со смыслом, внутри простое оформление
const FORMAT_ORDER: TextFormat[] = [
  'quote',
  'codeBlock',
  'spoiler',
  'link',
  'mention',
  'code',
  'bold',
  'italic',
  'underline',
  'strikethrough',
]

/** Виды форматирования сегмента от внешнего к внутреннему, без повторов. */
export function orderFormats(formats: TextFormat[] = []): TextFormat[] {
  return FORMAT_ORDER.filter((format) => formats.includes(format))
}
