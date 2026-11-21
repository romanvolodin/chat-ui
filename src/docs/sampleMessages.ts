import type { Message, MessageExcerpt, Reaction, UserMessage } from '../types'
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

function baseMessage(number: number): Message {
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

function excerptOf(message: Message): MessageExcerpt {
  return message.type === 'system'
    ? { isSystem: true, text: message.text }
    : { authorId: message.authorId, ...(message.text ? { text: message.text } : {}) }
}

function reactionsOf(number: number): Reaction[] | undefined {
  if (number % 9 === 0) {
    return [
      { icon: { emoji: '👍' }, count: 2 },
      { icon: { emoji: '🔥' }, count: 1, isMine: true },
    ]
  }
  if (number % 13 === 0) return [{ icon: { emoji: '😂' }, count: 5 }]
  return undefined
}

// Каждое одиннадцатое сообщение отвечает на третье перед ним; сообщение 162 отвечает на далёкое (120),
// которого в загруженной части нет: так видно переход через движок
function replyTargetOf(number: number): number | undefined {
  if (number === 162) return 120
  return number % 11 === 0 ? number - 3 : undefined
}

function sampleMessage(number: number): Message {
  const message = baseMessage(number)
  if (message.type === 'system') return message

  const reactions = reactionsOf(number)
  const target = replyTargetOf(number)
  const reply: Pick<UserMessage, 'replyTo'> =
    target === undefined
      ? {}
      : { replyTo: { messageId: `m${String(target)}`, excerpt: excerptOf(baseMessage(target)) } }
  return { ...message, ...(reactions ? { reactions } : {}), ...reply }
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
