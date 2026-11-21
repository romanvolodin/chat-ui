import type { FormattedText, MessageId } from '../../types'

/**
 * Режим поля ввода: ответ на сообщение или редактирование. Его хранит сам интерфейс (решение 21 контракта),
 * а наружу уходят только готовые события отправки и редактирования.
 */
export type ComposerMode =
  | {
      kind: 'reply'
      messageId: MessageId
      authorName: string
      /** Сжатый текст цитируемого сообщения или подпись вложения для плашки. */
      text: string
      /** Выделенные слова, если отвечают на фрагмент: уйдут вместе с событием отправки. */
      quote?: FormattedText
    }
  | { kind: 'edit'; messageId: MessageId; text: FormattedText }
