import type { ChatId } from './ids'

export type ChatType = 'private' | 'group' | 'channel' | 'discussion'

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
}
