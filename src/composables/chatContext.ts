import { computed, inject, provide, toRef, type InjectionKey, type Ref } from 'vue'
import type { ChatRootProps, UserDirectory, UserId } from '../types'
import { useNow } from './useNow'

export interface ChatContext {
  currentUserId: Readonly<Ref<UserId>>
  users: Readonly<Ref<UserDirectory>>
  now: Readonly<Ref<Date>>
  timeZone: Readonly<Ref<string | undefined>>
  isReadOnly: Readonly<Ref<boolean>>
}

const chatContextKey: InjectionKey<ChatContext> = Symbol('chatContext')

export function provideChatContext(props: ChatRootProps): ChatContext {
  const context: ChatContext = {
    currentUserId: toRef(props, 'currentUserId'),
    users: toRef(props, 'users'),
    now: useNow(() => props.settings?.now),
    timeZone: computed(() => props.settings?.timeZone),
    isReadOnly: computed(() => props.isReadOnly ?? false),
  }
  provide(chatContextKey, context)
  return context
}

export function useChatContext(): ChatContext {
  const context = inject(chatContextKey)
  if (!context) throw new Error('useChatContext вызван вне ChatRoot')
  return context
}
