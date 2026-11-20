import type { Message } from '../types'
import { sampleNow } from './sampleData'

const MINUTE = 60_000
// Сообщение с номером LAST_NUMBER отправлено «сейчас», каждое предыдущее на 40 минут раньше
const LAST_NUMBER = 200
const STEP_MINUTES = 40

const authors = ['ivan', 'ivan', 'anna', 'me', 'me', 'me', 'anna', 'ivan']
const phrases = [
  'Завтра выезд в 8:00 от главного входа',
  'Принято',
  'Багаж и оборудование собираем заранее, чтобы не задерживать отправление',
  'Машину подготовили, ждём остальных',
  'Ок',
  'Во сколько планируем вернуться сегодня?',
  'Если погода не испортится, заедем на озеро до обеда',
]

const sentAtOf = (number: number) =>
  new Date(sampleNow.getTime() - (LAST_NUMBER - number) * STEP_MINUTES * MINUTE)

function sampleMessage(number: number): Message {
  const id = `m${String(number)}`
  const sentAt = sentAtOf(number)

  if (number === 175) {
    return {
      type: 'system',
      id,
      sentAt,
      authorId: 'anna',
      text: [{ text: ' добавила Олега в чат' }],
    }
  }

  const authorId = authors[number % authors.length] ?? 'ivan'
  const phrase = phrases[number % phrases.length] ?? ''
  const text =
    number % 7 === 0
      ? [
          { text: 'Смотрите ' },
          { text: 'график выезда', format: ['link' as const], url: 'https://example.com' },
          { text: ', ' },
          { text: 'важно', format: ['bold' as const] },
          { text: `: ${phrase.toLowerCase()}` },
        ]
      : [{ text: phrase }]

  return {
    type: 'user',
    id,
    authorId,
    sentAt,
    text,
    ...(authorId === 'me' ? { status: number < 195 ? ('read' as const) : ('sent' as const) } : {}),
  }
}

/**
 * Детерминированная переписка для историй и тестов: сообщения с номерами от `from` до `to`
 * включительно. Номер `200` отправлен «сейчас», а меньшие номера раньше, так что соседние
 * диапазоны (например, 161–200 и 141–160) стыкуются, как порции истории.
 */
export function createSampleMessages(from: number, to: number): Message[] {
  return Array.from({ length: to - from + 1 }, (_, index) => sampleMessage(from + index))
}

/** Сорок последних сообщений: охватывают вчера и сегодня, внутри есть системное сообщение. */
export const sampleMessages = createSampleMessages(161, 200)
