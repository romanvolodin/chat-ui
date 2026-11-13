import type { MessageExcerpt, PinnedMessage } from './excerpt'
import type { ChatId, MessageId, UserId } from './ids'
import type { Message, MessageStatus } from './message'
import type { FormattedText } from './text'

export type ChatType = 'private' | 'group' | 'channel' | 'discussion'

export interface LastMessage {
  excerpt: MessageExcerpt
  sentAt: Date
  status?: MessageStatus
}

export interface Chat {
  id: ChatId
  type: ChatType
  title: string
  avatar?: string
  subtitle?: string
  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean
  unreadCount?: number
  unreadMentionCount?: number
  lastMessage?: LastMessage
  /** Собеседник. Только у личных чатов. */
  peerId?: UserId
  memberCount?: number
  typingUserIds?: UserId[]
}

export type ChatFooter =
  | { type: 'input' }
  | { type: 'mute' }
  | { type: 'join' }
  | { type: 'unpinAll' }
  | { type: 'readOnly'; text?: string }

export interface OpenChat extends Chat {
  footer: ChatFooter
  messages: Message[]
  /** Выше/ниже загруженных сообщений есть ещё. Если не задано - больше нет */
  hasMoreBefore?: boolean
  hasMoreAfter?: boolean
  pinned?: PinnedMessage[]
  draft?: FormattedText
  /** Адрес картинки. Иначе фон берётся из темы. */
  background?: string
  firstUnreadMessageId?: MessageId
}
