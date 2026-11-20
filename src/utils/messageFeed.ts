import type { Message, MessageId, SystemMessage, UserId, UserMessage } from '../types'
import { getDayKey } from './dateTime'

export type FeedItem =
  | { kind: 'date'; key: string; date: Date }
  | { kind: 'unread'; key: string }
  | { kind: 'system'; key: string; message: SystemMessage }
  | {
      kind: 'group'
      key: string
      authorId: UserId
      isOutgoing: boolean
      messages: UserMessage[]
    }

export interface FeedOptions {
  currentUserId: UserId
  timeZone?: string
  firstUnreadMessageId?: MessageId
}

/**
 * Лента чата из списка сообщений: заголовки дней, метка «Непрочитанные сообщения», системные
 * сообщения и группы подряд идущих сообщений одного автора. Порядок сообщений не меняется.
 * Группа обрывается при смене автора, дня, системном сообщении и метке непрочитанных.
 */
export function buildFeed(messages: Message[], options: FeedOptions): FeedItem[] {
  const feed: FeedItem[] = []
  let currentDay: string | undefined
  let openGroup: Extract<FeedItem, { kind: 'group' }> | undefined

  for (const message of messages) {
    const day = getDayKey(message.sentAt, options.timeZone)
    if (day !== currentDay) {
      currentDay = day
      openGroup = undefined
      feed.push({ kind: 'date', key: `date-${day}`, date: message.sentAt })
    }

    if (message.id === options.firstUnreadMessageId) {
      openGroup = undefined
      feed.push({ kind: 'unread', key: 'unread' })
    }

    if (message.type === 'system') {
      openGroup = undefined
      feed.push({ kind: 'system', key: `system-${message.id}`, message })
    } else if (openGroup?.authorId === message.authorId) {
      openGroup.messages.push(message)
    } else {
      openGroup = {
        kind: 'group',
        key: `group-${message.id}`,
        authorId: message.authorId,
        isOutgoing: message.authorId === options.currentUserId,
        messages: [message],
      }
      feed.push(openGroup)
    }
  }

  return feed
}
