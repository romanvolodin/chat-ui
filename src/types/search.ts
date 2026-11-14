import type { Chat } from './chat'
import type { MessageExcerpt } from './excerpt'
import type { ChatId, MessageId, UserId } from './ids'

export type SearchScope = 'global' | 'chat'

export interface SearchMessageResult {
  chatId: ChatId
  messageId: MessageId
  excerpt: MessageExcerpt
  sentAt: Date
}

/**
 * Привязаны к паре «запрос и область»: движок возвращает их с теми же `query` и `scope`,
 * что получил в событии `search`, без изменений. Другие результаты интерфейс игнорирует.
 */
export type SearchResults =
  | {
      scope: 'global'
      query: string
      messages: SearchMessageResult[]
      users: UserId[]
      chats: Chat[]
    }
  | {
      scope: 'chat'
      query: string
      /** Найденные сообщения открытого чата по порядку. Могут быть вне загруженной истории. */
      messageIds: MessageId[]
    }
