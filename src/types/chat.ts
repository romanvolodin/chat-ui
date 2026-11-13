import type { MessageExcerpt } from './excerpt'
import type { ChatId, UserId } from './ids'
import type { MessageStatus } from './message'

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
}
