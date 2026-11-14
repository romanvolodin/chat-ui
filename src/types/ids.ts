/** Интерфейс ничего не знает и не предполагает об идентификаторах, использует как есть */

export type UserId = string

export type ChatId = string

export type MessageId = string

export type ListId =
  'chats' | 'archive' | 'messages' | 'searchResults' | 'members' | 'media' | 'files' | 'links'
