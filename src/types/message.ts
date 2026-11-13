import type { MessageContent } from './content'
import type { MessageId, UserId } from './ids'
import type { FormattedText } from './text'

export type MessageStatus = 'sending' | 'sent' | 'read' | 'error'

export interface Message {
  id: MessageId
  authorId: UserId
  sentAt: Date
  /** Текст сообщения или подпись к вложению. */
  text?: FormattedText
  content?: MessageContent
  /** Только у исходящих сообщений. */
  status?: MessageStatus
  /** Только при статусе `sending`, от 0 до 100. По нему рисуется индикатор загрузки. */
  sendProgressPercent?: number
}
