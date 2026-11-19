import type { Chat, UserDirectory, UserId } from '../types'
import { formatLastSeen } from './dateTime'
import { pluralize } from './plural'
import { UNKNOWN_USER_NAME } from './excerpt'

export interface ChatStatus {
  text: string
  /** «Онлайн» и «печатает…» выделяются цветом. */
  isHighlighted: boolean
}

export interface ChatStatusContext {
  users: UserDirectory
  now: Date
  timeZone?: string
}

const plain = (text: string): ChatStatus => ({ text, isHighlighted: false })
const highlighted = (text: string): ChatStatus => ({ text, isHighlighted: true })

function typingText(chat: Chat, users: UserDirectory): string {
  const ids = chat.typingUserIds ?? []
  if (ids.length === 0) return ''
  if (chat.type === 'private') return 'печатает…'

  const nameOf = (id: UserId) => users[id]?.name ?? UNKNOWN_USER_NAME
  const [first, second] = ids
  if (ids.length === 1 && first !== undefined) return `${nameOf(first)} печатает…`
  if (ids.length === 2 && first !== undefined && second !== undefined) {
    return `${nameOf(first)} и ${nameOf(second)} печатают…`
  }
  const noun = pluralize(ids.length, ['пользователь', 'пользователя', 'пользователей'])
  return `${String(ids.length)} ${noun} печатают…`
}

function privateStatus(chat: Chat, { users, now, timeZone }: ChatStatusContext): ChatStatus {
  const peer = chat.peerId === undefined ? undefined : users[chat.peerId]
  if (!peer) return plain('')
  if (peer.isBot) return plain('Бот')
  if (peer.isOnline) return highlighted('онлайн')
  if (peer.lastActiveAt)
    return plain(`был в сети ${formatLastSeen(peer.lastActiveAt, now, timeZone)}`)
  return plain('')
}

/**
 * Строка под названием чата. Подпись из данных чата главнее всего остального.
 * Скрытый статус («был недавно») движок передаёт именно подписью.
 */
export function chatStatus(chat: Chat, context: ChatStatusContext): ChatStatus {
  if (chat.subtitle) return plain(chat.subtitle)

  const typing = typingText(chat, context.users)
  if (typing) return highlighted(typing)

  if (chat.type === 'private') return privateStatus(chat, context)

  if (chat.memberCount !== undefined) {
    const noun = pluralize(chat.memberCount, ['участник', 'участника', 'участников'])
    return plain(`${String(chat.memberCount)} ${noun}`)
  }
  return plain('')
}
