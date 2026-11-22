import type { MenuItem } from '../components/base/BaseDropdownMenu.vue'
import type { UserMessage } from '../types'

export type MessageMenuAction = 'reply' | 'edit' | 'pin' | 'unpin' | 'getLink' | 'delete'

export interface MessageMenuOptions {
  /** Сообщение отправил текущий пользователь. */
  isOutgoing: boolean
  /** В чат можно писать: ответить и отредактировать можно только тогда. */
  canWrite: boolean
  /** Перед вызовом меню в тексте этого сообщения выделили слова. */
  hasSelection: boolean
}

const EDITABLE_STATUSES = [undefined, 'sent', 'read']

/**
 * Пункты контекстного меню сообщения. Пересылка и выделение нескольких сообщений появятся вместе с
 * окном выбора чата и режимом выделения, пока их в меню нет.
 */
export function messageMenuItems(
  message: UserMessage,
  { isOutgoing, canWrite, hasSelection }: MessageMenuOptions,
): MenuItem[] {
  const items: MenuItem[] = []

  if (canWrite) {
    items.push({
      id: 'reply' satisfies MessageMenuAction,
      label: hasSelection ? 'Ответить на выделенное' : 'Ответить',
      icon: 'reply',
    })
  }

  const hasText = (message.text?.length ?? 0) > 0
  if (canWrite && isOutgoing && hasText && EDITABLE_STATUSES.includes(message.status)) {
    items.push({ id: 'edit' satisfies MessageMenuAction, label: 'Изменить', icon: 'edit' })
  }

  items.push(
    message.isPinned
      ? { id: 'unpin' satisfies MessageMenuAction, label: 'Открепить', icon: 'pin-off' }
      : { id: 'pin' satisfies MessageMenuAction, label: 'Закрепить', icon: 'pin' },
    { id: 'getLink' satisfies MessageMenuAction, label: 'Получить ссылку', icon: 'link' },
    { id: 'delete' satisfies MessageMenuAction, label: 'Удалить', icon: 'trash', isDanger: true },
  )

  return items
}
