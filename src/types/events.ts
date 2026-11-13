import type { ChatId, MessageId } from './ids'

export interface ChatEvents {
  selectChat: [payload: { chatId: ChatId }]
  readUntil: [payload: { messageId: MessageId }]
  goToMessage: [payload: { messageId: MessageId }]
  goToLatest: []
}
