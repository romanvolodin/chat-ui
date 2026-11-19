import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import ChatRoot from './ChatRoot.vue'

function mount(attrs: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  createApp({
    render: () => h(ChatRoot, { currentUserId: 'me', users: {}, chats: [], ...attrs }),
  }).mount(container)
  return container
}

describe('ChatRoot', () => {
  it('рисует корневой элемент чата', () => {
    expect(mount().querySelector('.chat-root')).not.toBeNull()
  })

  it('передаёт класс проекта на корневой элемент: так переопределяется тема', () => {
    const root = mount({ class: 'my-theme' }).querySelector('.chat-root')
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
})
