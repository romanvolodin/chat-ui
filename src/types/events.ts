import type { ChatId, MessageId } from './ids'
import type { ReactionIcon } from './reaction'
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
  deleteMessages: [payload: { messageIds: MessageId[]; scope: 'self' | 'everyone' }]
  setReaction: [payload: { messageId: MessageId; icon: ReactionIcon; isSet: boolean }]
  setMessagePinned: [payload: { messageId: MessageId; isPinned: boolean }]
  /** `optionId: null` отзывает голос. */
  vote: [payload: { messageId: MessageId; optionId: string | null }]
  forwardMessages: [payload: { messageIds: MessageId[]; chatId: ChatId }]
  getLink: [payload: { messageId: MessageId } | { chatId: ChatId }]
}
