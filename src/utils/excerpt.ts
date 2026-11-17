import type { ChatType, FormattedText, MessageExcerpt, UserDirectory, UserId } from '../types'

const CONTENT_LABELS: Record<NonNullable<MessageExcerpt['contentKind']>, string> = {
  image: 'Фото',
  video: 'Видео',
  album: 'Альбом',
  file: 'Файл',
  audio: 'Голосовое сообщение',
  videoCircle: 'Видеосообщение',
  sticker: 'Стикер',
  poll: 'Опрос',
  location: 'Геопозиция',
  contact: 'Контакт',
  call: 'Звонок',
}

export const UNKNOWN_USER_NAME = 'Неизвестный пользователь'

export function plainText(text: FormattedText): string {
  return text
    .map((segment) => segment.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Текст сообщения, а если его нет, подпись по типу вложения. */
export function excerptText(excerpt: MessageExcerpt): string {
  const text = excerpt.text ? plainText(excerpt.text) : ''
  if (text) return text
  return excerpt.contentKind ? CONTENT_LABELS[excerpt.contentKind] : ''
}

interface ChatListExcerptOptions {
  chatType: ChatType
  users: UserDirectory
  currentUserId: UserId
}

/** Последнее сообщение в строке списка: свои с «Вы:», в группах и каналах с именем автора. */
export function chatListExcerpt(
  excerpt: MessageExcerpt,
  { chatType, users, currentUserId }: ChatListExcerptOptions,
): string {
  const text = excerptText(excerpt)
  const { authorId } = excerpt
  if (excerpt.isSystem || authorId === undefined) return text
  if (authorId === currentUserId) return `Вы: ${text}`
  if (chatType === 'private') return text
  return `${users[authorId]?.name ?? UNKNOWN_USER_NAME}: ${text}`
}
