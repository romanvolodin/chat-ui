import type { Chat, OpenChat } from './chat'
import type { ListId, UserId } from './ids'
import type { SearchResults } from './search'
import type { ChatSettings } from './settings'
import type { UserDirectory } from './user'

export interface ChatRootData {
  currentUserId: UserId
  users: UserDirectory
  /** В готовом порядке, закреплённые вверху: интерфейс не сортирует. */
  chats: Chat[]
  archive?: Chat[]
  openChat?: OpenChat
  /** Интерфейс сам сеть не проверяет, плашка «Нет сети» показывается по этому флагу. */
  isOffline?: boolean
  /** Пока список есть в этом перечне, у него показывается индикатор загрузки. */
  loadingLists?: ListId[]
  /**
   * Ответ на событие `getLink`: интерфейс копирует адрес в буфер обмена. Каждый ответ нужно передавать
   * новым объектом, даже если адрес тот же, иначе повторный запрос не будет замечен.
   */
  requestedLink?: { url: string }
  searchResults?: SearchResults
}

export interface ChatRootProps extends ChatRootData {
  settings?: ChatSettings
  /** Режим «только чтение» для встроенного чата. */
  isReadOnly?: boolean
}
