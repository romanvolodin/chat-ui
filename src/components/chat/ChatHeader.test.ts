import { afterEach, describe, expect, it, vi } from 'vitest'
import { groupChat, pinnedChat } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import ChatHeader from './ChatHeader.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(props: Record<string, unknown>) {
  mounted = mountWithChatContext(ChatHeader, props)
  return mounted.container
}

describe('ChatHeader', () => {
  it('показывает название и статусную строку', () => {
    const container = mount({ chat: pinnedChat })
    expect(container.querySelector('.chat-header__title')?.textContent).toBe('Иван Петров')
    expect(container.querySelector('.chat-status-line')?.textContent.trim()).toBe('онлайн')
  })

  it('отмечает аватар собеседника, который в сети', () => {
    expect(mount({ chat: pinnedChat }).querySelector('.chat-avatar__online')).not.toBeNull()
  })

  it('у группы нет отметки «в сети» на аватаре', () => {
    expect(mount({ chat: groupChat }).querySelector('.chat-avatar__online')).toBeNull()
  })

  it('нажатие «назад» сообщает о закрытии чата', () => {
    const onCloseChat = vi.fn()
    const container = mount({ chat: pinnedChat, onCloseChat })
    container.querySelector<HTMLElement>('.chat-header__back button')?.click()
    expect(onCloseChat).toHaveBeenCalledOnce()
  })

  it('у кнопки «назад» есть название для скринридера', () => {
    const button = mount({ chat: pinnedChat }).querySelector('.chat-header__back button')
    expect(button?.getAttribute('aria-label')).toBe('К списку чатов')
  })

  it('кнопка поиска просит открыть поиск по чату', () => {
    const onOpenSearch = vi.fn()
    const container = mount({ chat: pinnedChat, onOpenSearch })
    const button = container.querySelector<HTMLElement>('button[aria-label="Поиск по чату"]')
    button?.click()
    expect(onOpenSearch).toHaveBeenCalledOnce()
  })
})
