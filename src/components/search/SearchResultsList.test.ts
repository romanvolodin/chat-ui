import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { groupChat, ownPhotoChat, sampleSearchResults } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import SearchResultsList from './SearchResultsList.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

type Results = ReturnType<typeof sampleSearchResults>

function mount(props: Record<string, unknown> = {}, results: Results = sampleSearchResults('кни')) {
  mounted = mountWithChatContext(SearchResultsList, { results, ...props })
  return mounted.container
}

const headings = (container: HTMLElement) =>
  [...container.querySelectorAll('.chat-search-results__heading')].map((h) => h.textContent)

describe('SearchResultsList', () => {
  it('показывает разделы в порядке: чаты, пользователи, сообщения', () => {
    expect(headings(mount())).toEqual(['Чаты', 'Пользователи', 'Сообщения'])
  })

  it('скрывает пустые разделы', () => {
    const results = { ...sampleSearchResults('кни'), users: [], messages: [] }
    expect(headings(mount({}, results))).toEqual(['Чаты'])
  })

  it('показывает чаты строками списка', () => {
    const titles = [...mount().querySelectorAll('.chat-list-item__title')].map((t) => t.textContent)
    expect(titles).toEqual([groupChat.title, ownPhotoChat.title])
  })

  it('показывает пользователей по справочнику, неизвестных с заглушкой', () => {
    const results = {
      ...sampleSearchResults('кни'),
      chats: [],
      messages: [],
      users: ['ivan', 'ghost'],
    }
    const titles = [...mount({}, results).querySelectorAll('.chat-search-result__title')].map(
      (t) => t.textContent,
    )
    expect(titles).toEqual(['Иван Петров', 'Неизвестный пользователь'])
  })

  it('подписывает сообщение известного чата его названием и автором', () => {
    const rows = mount().querySelectorAll('.chat-search-result')
    const message = [...rows].find((row) => row.textContent.includes('Завтра сбор'))
    expect(message?.querySelector('.chat-search-result__title')?.textContent).toBe(groupChat.title)
    expect(message?.querySelector('.chat-search-result__subtitle')?.textContent).toBe(
      'Анна Смирнова: Завтра сбор в 8:00 на первой точке',
    )
  })

  it('для неизвестного чата подписывает сообщение автором, а текст без префикса', () => {
    const rows = mount().querySelectorAll('.chat-search-result')
    const message = [...rows].find((row) => row.textContent.includes('Договорились о сроках'))
    expect(message?.querySelector('.chat-search-result__title')?.textContent).toBe('Олег')
    expect(message?.querySelector('.chat-search-result__subtitle')?.textContent).toBe(
      'Договорились о сроках',
    )
  })

  it('берёт название чата из известных чатов, если его нет в результатах', () => {
    const results = { ...sampleSearchResults('кни'), chats: [] }
    const container = mount({ knownChats: [groupChat] }, results)
    const message = [...container.querySelectorAll('.chat-search-result')].find((row) =>
      row.textContent.includes('Завтра сбор'),
    )
    expect(message?.querySelector('.chat-search-result__title')?.textContent).toBe(groupChat.title)
  })

  it('показывает время сообщения', () => {
    const times = [...mount().querySelectorAll('.chat-search-result__time')].map(
      (t) => t.textContent,
    )
    expect(times).toEqual(['14:00', 'Сб'])
  })

  it('сообщает о выборе чата', async () => {
    const onSelectChat = vi.fn()
    mount({ onSelectChat }).querySelector<HTMLButtonElement>('.chat-list-item')?.click()
    await nextTick()
    expect(onSelectChat).toHaveBeenCalledWith({ chatId: groupChat.id })
  })

  it('сообщает об открытии пользователя', async () => {
    const onOpenUser = vi.fn()
    const container = mount({ onOpenUser })
    const userRow = [...container.querySelectorAll<HTMLButtonElement>('.chat-search-result')].find(
      (row) => row.textContent.includes('Иван Петров'),
    )
    userRow?.click()
    await nextTick()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'ivan' })
  })

  it('сообщает о переходе к сообщению', async () => {
    const onGoToMessage = vi.fn()
    const container = mount({ onGoToMessage })
    const row = [...container.querySelectorAll<HTMLButtonElement>('.chat-search-result')].find(
      (item) => item.textContent.includes('Договорились о сроках'),
    )
    row?.click()
    await nextTick()
    expect(onGoToMessage).toHaveBeenCalledWith({ messageId: 'm2' })
  })

  it('без результатов пишет «Ничего не найдено»', () => {
    const empty = { scope: 'global' as const, query: 'яяя', chats: [], users: [], messages: [] }
    expect(mount({}, empty).querySelector('.chat-search-results__empty')?.textContent).toBe(
      'Ничего не найдено',
    )
  })

  it('пока идёт загрузка, показывает индикатор и не пишет «Ничего не найдено»', () => {
    const empty = { scope: 'global' as const, query: 'яяя', chats: [], users: [], messages: [] }
    const container = mount({ isLoading: true }, empty)
    expect(container.querySelector('.chat-spinner')).not.toBeNull()
    expect(container.querySelector('.chat-search-results__empty')).toBeNull()
  })
})
