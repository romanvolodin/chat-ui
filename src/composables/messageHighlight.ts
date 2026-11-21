import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { MessageId } from '../types'

type HighlightedId = Readonly<Ref<MessageId | undefined>>

const key: InjectionKey<HighlightedId> = Symbol('chat-highlighted-message-id')
const nothingHighlighted = ref<MessageId | undefined>(undefined)

/** Список сообщений сообщает вложенным сообщениям, какое из них подсветить после перехода. */
export function provideHighlightedMessageId(id: HighlightedId) {
  provide(key, id)
}

/** Вне списка сообщений (в историях, в тестах) подсвеченного сообщения нет. */
export function useHighlightedMessageId(): HighlightedId {
  return inject(key, nothingHighlighted)
}
