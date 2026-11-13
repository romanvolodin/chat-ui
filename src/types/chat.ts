import type { MessageExcerpt } from './excerpt'
import type { ChatId } from './ids'
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
  avatar: string
  subtitle?: string
  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean
  unreadCount?: number
  unreadMentionCount?: number
  lastMessage?: LastMessage
}
