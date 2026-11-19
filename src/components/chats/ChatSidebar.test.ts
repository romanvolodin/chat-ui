import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { sampleChats, sampleSearchResults } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import ChatSidebar from './ChatSidebar.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

class FakeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('IntersectionObserver', FakeObserver)

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(extra: Record<string, unknown> = {}) {
  const props = reactive({ chats: sampleChats, ...extra }) as Record<string, unknown>
  mounted = mountWithChatContext(ChatSidebar, props)
  const container = mounted.container
  const field = container.querySelector<HTMLInputElement>('.chat-search-input__field')
  if (!field) throw new Error('нет поля поиска')
  const type = async (text: string) => {
    field.value = text
    field.dispatchEvent(new Event('input'))
    await nextTick()
  }
  return { container, type }
}

describe('ChatSidebar', () => {
  it('сначала показывает поле поиска и список чатов', () => {
    const { container } = mount()
    expect(container.querySelector('.chat-search')).not.toBeNull()
    expect(container.querySelectorAll('.chat-list-item')).toHaveLength(sampleChats.length)
    expect(container.querySelector('.chat-search-results')).toBeNull()
  })

  it('при вводе запроса показывает результаты вместо списка чатов', async () => {
    const { container, type } = mount({ searchResults: sampleSearchResults('кни') })
    await type('кни')
    expect(container.querySelector('.chat-search-results')).not.toBeNull()
    expect(container.querySelector('.chat-list')).toBeNull()
  })

  it('игнорирует результаты другого запроса', async () => {
    const { container, type } = mount({ searchResults: sampleSearchResults('кни') })
    await type('книг')
    expect(container.querySelector('.chat-search-results')).toBeNull()
    expect(container.querySelector('.chat-list')).toBeNull()
  })

  it('сравнивает запрос точно: без обрезки пробелов и смены регистра', async () => {
    const { container, type } = mount({ searchResults: sampleSearchResults('кни') })
    await type('Кни')
    expect(container.querySelector('.chat-search-results')).toBeNull()
    await type('кни ')
    expect(container.querySelector('.chat-search-results')).toBeNull()
  })

  it('пока результаты не пришли, показывает индикатор, если список поиска загружается', async () => {
    const { container, type } = mount({ loadingLists: ['searchResults'] })
    await type('кни')
    expect(container.querySelector('.chat-sidebar__loading .chat-spinner')).not.toBeNull()
  })

  it('без загрузки и без результатов показывает пустое место', async () => {
    const { container, type } = mount()
    await type('кни')
    expect(container.querySelector('.chat-spinner')).toBeNull()
    expect(container.querySelector('.chat-sidebar__body')?.children).toHaveLength(0)
  })

  it('возвращает список чатов, когда запрос стёрт', async () => {
    const { container, type } = mount({ searchResults: sampleSearchResults('кни') })
    await type('кни')
    await type('')
    expect(container.querySelector('.chat-search-results')).toBeNull()
    expect(container.querySelectorAll('.chat-list-item')).toHaveLength(sampleChats.length)
  })

  it('пробелы вместо запроса оставляют список чатов', async () => {
    const { container, type } = mount()
    await type('   ')
    expect(container.querySelector('.chat-list')).not.toBeNull()
  })

  it('передаёт признак загрузки списка чатов', () => {
    const { container } = mount({ loadingLists: ['chats'] })
    expect(container.querySelector('.chat-list .chat-spinner')).not.toBeNull()
  })

  it('сообщает о выборе чата из списка в виде события контракта', async () => {
    const onSelectChat = vi.fn()
    const { container } = mount({ onSelectChat })
    container.querySelector<HTMLButtonElement>('.chat-list-item')?.click()
    await nextTick()
    expect(onSelectChat).toHaveBeenCalledWith({ chatId: sampleChats[0]?.id })
  })

  it('пробрасывает события результатов поиска', async () => {
    const onSelectChat = vi.fn()
    const onOpenUser = vi.fn()
    const onGoToMessage = vi.fn()
    const { container, type } = mount({
      searchResults: sampleSearchResults('кни'),
      onSelectChat,
      onOpenUser,
      onGoToMessage,
    })
    await type('кни')
    const rows = [...container.querySelectorAll<HTMLButtonElement>('button')]
    rows.find((row) => row.classList.contains('chat-list-item'))?.click()
    rows.find((row) => row.textContent.includes('Иван Петров'))?.click()
    rows.find((row) => row.textContent.includes('Договорились о сроках'))?.click()
    await nextTick()
    expect(onSelectChat).toHaveBeenCalledOnce()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'ivan' })
    expect(onGoToMessage).toHaveBeenCalledWith({ messageId: 'm2' })
  })
})
