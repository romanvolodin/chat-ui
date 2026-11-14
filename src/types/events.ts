import type { CallKind } from './content'
import type { ChatId, ListId, MessageId, UserId } from './ids'
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
  setChatMuted: [payload: { chatId: ChatId; isMuted: boolean }]
  setChatPinned: [payload: { chatId: ChatId; isPinned: boolean }]
  setChatArchived: [payload: { chatId: ChatId; isArchived: boolean }]
  setUserBlocked: [payload: { userId: UserId; isBlocked: boolean }]
  joinChat: [payload: { chatId: ChatId }]
  unpinAllMessages: [payload: { chatId: ChatId }]
  openPinned: [payload: { chatId: ChatId }]
  openComments: [payload: { messageId: MessageId }]
  search: [payload: { query: string; scope: 'global' | 'chat' }]
  showReactionUsers: [payload: { messageId: MessageId; icon: ReactionIcon }]
  openUser: [payload: { userId: UserId }]
  startCall: [payload: { kind: CallKind }]
  openLocation: [payload: { messageId: MessageId }]
  reachedTop: [payload: { list: ListId }]
  reachedBottom: [payload: { list: ListId }]
}

/** Единый поток событий: `type` и рядом поля нагрузки, поэтому в нагрузках нет поля `type`. */
export type ChatEvent = {
  [K in keyof ChatEvents]: ChatEvents[K] extends [payload: infer P] ? { type: K } & P : { type: K }
}[keyof ChatEvents]
