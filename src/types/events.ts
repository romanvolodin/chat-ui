import type { ChatId, MessageId } from './ids'
import type { FormattedText } from './text'

export interface ChatEvents {
  selectChat: [payload: { chatId: ChatId }]
  readUntil: [payload: { messageId: MessageId }]
  goToMessage: [payload: { messageId: MessageId }]
  goToLatest: []
  changeDraft: [payload: { text: FormattedText }]
  sendMessage: [
    payload: {
      text?: FormattedText
      files?: File[]
      replyTo?: { messageId: MessageId; text?: FormattedText }
    },
  ]
  cancelSend: [payload: { messageId: MessageId }]
  retrySend: [payload: { messageId: MessageId }]
  /** Вложения при редактировании не меняются. */
  editMessage: [payload: { messageId: MessageId; text: FormattedText }]
}
