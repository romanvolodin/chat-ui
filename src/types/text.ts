import type { UserId } from './ids'

export type TextFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'spoiler'
  | 'code'
  | 'codeBlock'
  | 'quote'
  | 'link'
  | 'mention'

export interface TextSegment {
  text: string
  format?: TextFormat[]
  /** Адрес для формата `link`. Если не задан, адресом считается сам `text`. */
  url?: string
  /** Язык для формата `codeBlock`, например `css`. */
  language?: string
  /** Упомянутый пользователь для формата `mention`. */
  userId?: UserId
}

/**
 * Текст с форматированием: всегда список сегментов, простой строки вместо списка нет.
 * Склеенные подряд сегменты дают исходный текст. Так же устроены подписи к вложениям
 * и черновик.
 */
export type FormattedText = TextSegment[]
