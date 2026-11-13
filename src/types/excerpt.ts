import type { MessageContent } from './content'
import type { MessageId, UserId } from './ids'
import type { FormattedText } from './text'

/**
 * Готовый фрагмент сообщения: автор и текст или тип вложения. В таком же виде приходят
 * цитата в ответе, последнее сообщение в списке чатов и закреплённые сообщения.
 */
export interface MessageExcerpt {
  authorId: UserId
  text?: FormattedText
  contentKind?: MessageContent['type']
}

export interface ReplyTo {
  messageId: MessageId
  excerpt: MessageExcerpt
}
