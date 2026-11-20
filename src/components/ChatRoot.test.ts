import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App, type Component } from 'vue'
import {
  channelChat,
  pinnedChat,
  sampleChats,
  sampleNow,
  sampleTimeZone,
  sampleUsers,
} from '../docs/sampleData'
import { sampleMessages } from '../docs/sampleMessages'
import type { OpenChat } from '../types'
import ChatRoot from './ChatRoot.vue'

class FakeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('IntersectionObserver', FakeObserver)

const openChat: OpenChat = { ...pinnedChat, footer: { type: 'input' }, messages: [] }

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
})

function mount(attrs: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  const state: Record<string, unknown> = reactive({
    currentUserId: 'me',
    users: sampleUsers,
    chats: sampleChats,
    settings: { now: sampleNow, timeZone: sampleTimeZone },
    ...attrs,
  })
  app = createApp({ render: () => h(ChatRoot as Component, state) })
  app.mount(container)
  return { container, state }
}

describe('ChatRoot', () => {
  it('рисует корневой элемент чата', () => {
    expect(mount().container.querySelector('.chat-root')).not.toBeNull()
  })

  it('несёт классы корня и темы', () => {
    const root = mount().container.querySelector('.chat-root')
    expect(root?.classList.contains('chat-theme')).toBe(true)
  })

  it('передаёт класс проекта на корневой элемент: так переопределяется тема', () => {
    const root = mount({ class: 'my-theme' }).container.querySelector('.chat-root')
    expect(root?.classList.contains('my-theme')).toBe(true)
  })

  it('принимает все данные контракта и настройки как props', () => {
    const props = Object.keys(ChatRoot.props ?? {})
    for (const name of [
      'currentUserId',
      'users',
      'chats',
      'archive',
      'openChat',
      'isOffline',
      'loadingLists',
      'requestedLink',
      'searchResults',
      'settings',
      'isReadOnly',
    ]) {
      expect(props, name).toContain(name)
    }
  })

  it('объявляет все события контракта', () => {
    const emits = ChatRoot.emits as string[]
    for (const name of [
      'selectChat',
      'closeChat',
      'sendMessage',
      'deleteMessages',
      'reachedTop',
      'startCall',
    ]) {
      expect(emits, name).toContain(name)
    }
  })

  describe('раскладка', () => {
    it('показывает список чатов рядом с областью диалога', () => {
      const { container } = mount()
      expect(container.querySelectorAll('.chat-list-item')).toHaveLength(sampleChats.length)
      expect(container.querySelector('.chat-root__view')).not.toBeNull()
    })

    it('без открытого чата в узкой раскладке выбран список, а в области диалога заглушка', () => {
      const { container } = mount()
      expect(container.querySelector('.chat-root__layout')?.getAttribute('data-pane')).toBe('list')
      expect(container.querySelector('.chat-root__empty')?.textContent).toBe('Выберите чат')
    })

    it('с открытым чатом выбран диалог и заглушки нет', () => {
      const { container } = mount({ openChat })
      expect(container.querySelector('.chat-root__layout')?.getAttribute('data-pane')).toBe('chat')
      expect(container.querySelector('.chat-root__empty')).toBeNull()
    })

    it('переключает слой, когда движок открывает и закрывает чат', async () => {
      const { container, state } = mount()
      const layout = container.querySelector('.chat-root__layout')
      state.openChat = openChat
      await nextTick()
      expect(layout?.getAttribute('data-pane')).toBe('chat')
      state.openChat = undefined
      await nextTick()
      expect(layout?.getAttribute('data-pane')).toBe('list')
    })

    it('с открытым чатом рисует диалог с шапкой', () => {
      const { container } = mount({ openChat })
      expect(container.querySelector('.chat-view .chat-header__title')?.textContent).toBe(
        'Иван Петров',
      )
    })

    it('кнопка «назад» в шапке сообщает движку о закрытии чата', () => {
      const onCloseChat = vi.fn()
      const { container } = mount({ openChat, onCloseChat })
      container.querySelector<HTMLElement>('.chat-header__back button')?.click()
      expect(onCloseChat).toHaveBeenCalledOnce()
    })

    it('нижняя панель открытого чата сообщает движку о своих действиях', () => {
      const onJoinChat = vi.fn()
      const channel: OpenChat = { ...channelChat, footer: { type: 'join' }, messages: [] }
      const { container } = mount({ openChat: channel, onJoinChat })
      container.querySelector<HTMLElement>('.chat-footer-action')?.click()
      expect(onJoinChat).toHaveBeenCalledWith({ chatId: channelChat.id })
    })

    it('при переходе к другому чату строит диалог заново, а при обновлении того же сохраняет', async () => {
      const { container, state } = mount({ openChat })
      const first = container.querySelector('.chat-view')
      state.openChat = { ...openChat, isMuted: true }
      await nextTick()
      expect(container.querySelector('.chat-view')).toBe(first)
      state.openChat = { ...openChat, id: 'other-chat' }
      await nextTick()
      expect(container.querySelector('.chat-view')).not.toBe(first)
    })

    it('показывает индикатор, пока движок грузит сообщения', () => {
      const chat: OpenChat = { ...openChat, hasMoreBefore: true }
      const { container } = mount({ openChat: chat, loadingLists: ['messages'] })
      expect(container.querySelector('.chat-message-list__loading--top')).not.toBeNull()
    })

    it('индикатор не показывается, если грузится другой список', () => {
      const chat: OpenChat = { ...openChat, hasMoreBefore: true }
      const { container } = mount({ openChat: chat, loadingLists: ['chats'] })
      expect(container.querySelector('.chat-message-list__loading--top')).toBeNull()
    })

    it('сообщает движку, что внизу загруженного нужна следующая порция', () => {
      const onReachedBottom = vi.fn()
      const chat: OpenChat = { ...openChat, hasMoreAfter: true }
      mount({ openChat: chat, onReachedBottom })
      expect(onReachedBottom).toHaveBeenCalledWith({ list: 'messages' })
    })

    it('сообщает движку, до какого сообщения дочитали', async () => {
      vi.useFakeTimers()
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element,
      ) {
        return (
          this.classList.contains('chat-message-list__scroller')
            ? { top: 0, bottom: 500 }
            : { top: 100, bottom: 200 }
        ) as DOMRect
      })
      const onReadUntil = vi.fn()
      mount({
        openChat: { ...openChat, messages: sampleMessages, firstUnreadMessageId: 'm190' },
        onReadUntil,
      })
      await vi.advanceTimersByTimeAsync(200)
      // все сообщения «видны», значит дочитано до последнего
      expect(onReadUntil).toHaveBeenCalledWith({ messageId: 'm200' })
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    it('отмечает открытый чат в списке', () => {
      const { container } = mount({ openChat })
      const selected = container.querySelectorAll('.chat-list-item--selected')
      expect(selected).toHaveLength(1)
    })
  })

  describe('события списка чатов', () => {
    it('сообщает о выборе чата', () => {
      const onSelectChat = vi.fn()
      const { container } = mount({ onSelectChat })
      container.querySelector<HTMLElement>('.chat-list-item')?.click()
      expect(onSelectChat).toHaveBeenCalledWith({ chatId: sampleChats[0]?.id })
    })
  })
})
