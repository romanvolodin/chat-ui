import type { MessageExcerpt, PinnedMessage } from './excerpt'
import type { ChatId, MessageId, UserId } from './ids'
import type { Message, MessageStatus, UserMessage } from './message'
import type { ReactionIcon } from './reaction'
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

/** Если поле не задано, значит окно "Инфо чата" ещё не загружено. */
export interface ChatInfo {
  members?: UserId[]
  media?: UserMessage[]
  files?: UserMessage[]
  links?: UserMessage[]
}

/** Привязаны к паре "сообщение и реакция": ответ на другую пару интерфейс игнорирует. */
export interface ReactionUsers {
  messageId: MessageId
  icon: ReactionIcon
  userIds: UserId[]
}

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
  info?: ChatInfo
  reactionUsers?: ReactionUsers
}
