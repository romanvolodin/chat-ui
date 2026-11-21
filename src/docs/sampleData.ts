import type { Chat, SearchResults, UserDirectory } from '../types'

export const sampleNow = new Date('2026-11-17T12:00:00Z')
export const sampleTimeZone = 'Europe/Moscow'

export const sampleUsers: UserDirectory = {
  me: { id: 'me', name: 'Роман' },
  ivan: { id: 'ivan', name: 'Иван Петров', isOnline: true },
  anna: { id: 'anna', name: 'Анна Смирнова' },
  oleg: { id: 'oleg', name: 'Олег' },
  maria: { id: 'maria', name: 'Мария', lastActiveAt: new Date(sampleNow.getTime() - 25 * 60_000) },
  helper: { id: 'helper', name: 'Помощник', isBot: true },
  blocked: { id: 'blocked', name: 'Заблокированный', isBlocked: true },
}

const minutesAgo = (minutes: number) => new Date(sampleNow.getTime() - minutes * 60_000)
const daysAgo = (days: number) => minutesAgo(days * 24 * 60)

export const pinnedChat: Chat = {
  id: 'ivan',
  type: 'private',
  title: 'Иван Петров',
  peerId: 'ivan',
  isPinned: true,
  lastMessage: {
    excerpt: {
      authorId: 'ivan',
      text: [{ text: 'Супер, это сильно облегчит работу' }],
    },
    sentAt: minutesAgo(25),
  },
}

export const groupChat: Chat = {
  id: 'crew',
  type: 'group',
  title: 'Клуб анонимных собеседников',
  unreadCount: 12,
  unreadMentionCount: 1,
  lastMessage: {
    excerpt: { authorId: 'anna', text: [{ text: 'Завтра сбор в 8:00 на первой точке' }] },
    sentAt: minutesAgo(60),
  },
}

export const ownPhotoChat: Chat = {
  id: 'anna',
  type: 'private',
  title: 'Анна Смирнова',
  peerId: 'anna',
  lastMessage: {
    excerpt: { authorId: 'me', contentKind: 'image' },
    sentAt: minutesAgo(180),
    status: 'read',
  },
}

export const channelChat: Chat = {
  id: 'news',
  type: 'channel',
  title: 'Новости города',
  isMuted: true,
  unreadCount: 134,
  lastMessage: {
    excerpt: { authorId: 'oleg', text: [{ text: 'Открыт набор на новый проект' }] },
    sentAt: daysAgo(1),
  },
}

export const voiceChat: Chat = {
  id: 'oleg',
  type: 'private',
  title: 'Олег',
  peerId: 'oleg',
  lastMessage: {
    excerpt: { authorId: 'oleg', contentKind: 'audio' },
    sentAt: daysAgo(3),
  },
}

export const sentChat: Chat = {
  id: 'archive-notes',
  type: 'group',
  title: 'Заметки по проекту',
  lastMessage: {
    excerpt: { authorId: 'me', text: [{ text: 'Договорились о сроках' }] },
    sentAt: daysAgo(12),
    status: 'sent',
  },
}

export const failedChat: Chat = {
  id: 'old',
  type: 'private',
  title: 'Мария',
  lastMessage: {
    excerpt: { authorId: 'me', text: [{ text: 'Спасибо за помощь!' }] },
    sentAt: new Date('2025-06-10T09:00:00Z'),
    status: 'error',
  },
}

export const sampleChats: Chat[] = [
  pinnedChat,
  groupChat,
  ownPhotoChat,
  channelChat,
  voiceChat,
  sentChat,
  failedChat,
]

export function sampleSearchResults(query: string): Extract<SearchResults, { scope: 'global' }> {
  return {
    scope: 'global',
    query,
    chats: [groupChat, ownPhotoChat],
    users: ['ivan', 'anna'],
    messages: [
      {
        chatId: groupChat.id,
        messageId: 'm1',
        excerpt: { authorId: 'anna', text: [{ text: 'Завтра сбор в 8:00 на первой точке' }] },
        sentAt: new Date(sampleNow.getTime() - 60 * 60_000),
      },
      {
        chatId: 'unknown-chat',
        messageId: 'm2',
        excerpt: { authorId: 'oleg', text: [{ text: 'Договорились о сроках' }] },
        sentAt: new Date(sampleNow.getTime() - 3 * 24 * 60 * 60_000),
      },
    ],
  }
}
