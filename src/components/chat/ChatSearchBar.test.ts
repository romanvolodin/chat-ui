import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import type { SearchResults } from '../../types'
import ChatSearchBar from './ChatSearchBar.vue'

let app: App | undefined

beforeEach(() => {
  // Часы не подменяем: обработчики Vue сверяют время события с реальными часами и иначе пропускают клавиши
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ''
  vi.useRealTimers()
})

const chatResults = (query: string, messageIds: string[]): SearchResults => ({
  scope: 'chat',
  query,
  messageIds,
})

interface State {
  results?: SearchResults
  isLoading?: boolean
}

function mount(initial: State = {}, handlers: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const state = reactive<State>({ ...initial })
  app = createApp({ render: () => h(ChatSearchBar, { ...state, ...handlers }) })
  app.mount(container)

  const field = () => {
    const element = container.querySelector('input')
    if (!element) throw new Error('Нет поля ввода')
    return element
  }
  const type = async (value: string) => {
    field().value = value
    field().dispatchEvent(new Event('input'))
    await nextTick()
  }
  const pressEnter = async () => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
    await nextTick()
  }
  const counter = () => container.querySelector('.chat-search-bar__status')?.textContent.trim()
  const button = (label: string) =>
    container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  return { container, state, field, type, pressEnter, counter, button }
}

describe('ChatSearchBar', () => {
  it('сразу ставит курсор в поле', () => {
    const { field } = mount()
    expect(document.activeElement).toBe(field())
  })

  describe('отправка запроса', () => {
    it('уходит через 300 мс после последней буквы, область «чат»', async () => {
      const onSearch = vi.fn()
      const { type } = mount({}, { onSearch })
      await type('сбор')
      await vi.advanceTimersByTimeAsync(299)
      expect(onSearch).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'сбор', scope: 'chat' })
    })

    it('пока печатают, отправляется только последний вариант', async () => {
      const onSearch = vi.fn()
      const { type } = mount({}, { onSearch })
      await type('с')
      await vi.advanceTimersByTimeAsync(200)
      await type('сб')
      await vi.advanceTimersByTimeAsync(200)
      await type('сбор')
      await vi.advanceTimersByTimeAsync(300)
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'сбор', scope: 'chat' })
    })

    it('запрос уходит как есть, без обрезки пробелов', async () => {
      const onSearch = vi.fn()
      const { type } = mount({}, { onSearch })
      await type(' Сбор ')
      await vi.advanceTimersByTimeAsync(300)
      expect(onSearch).toHaveBeenCalledWith({ query: ' Сбор ', scope: 'chat' })
    })

    it('пустой запрос и одни пробелы не отправляются', async () => {
      const onSearch = vi.fn()
      const { type } = mount({}, { onSearch })
      await type('   ')
      await vi.advanceTimersByTimeAsync(500)
      expect(onSearch).not.toHaveBeenCalled()
    })

    it('Enter отправляет новый запрос сразу, не дожидаясь паузы', async () => {
      const onSearch = vi.fn()
      const { type, pressEnter } = mount({}, { onSearch })
      await type('сбор')
      await pressEnter()
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'сбор', scope: 'chat' })
      await vi.advanceTimersByTimeAsync(500)
      expect(onSearch).toHaveBeenCalledOnce()
    })

    it('тот же запрос повторно не отправляется', async () => {
      const onSearch = vi.fn()
      const { type } = mount({}, { onSearch })
      await type('сбор')
      await vi.advanceTimersByTimeAsync(300)
      await type('сбор ')
      await type('сбор')
      await vi.advanceTimersByTimeAsync(300)
      expect(onSearch).toHaveBeenCalledOnce()
    })
  })

  describe('результаты', () => {
    const searched = async (ids: string[], extra: Record<string, unknown> = {}) => {
      const onGoToMessage = vi.fn()
      const mounted = mount({}, { onGoToMessage, ...extra })
      await mounted.type('сбор')
      await vi.advanceTimersByTimeAsync(300)
      mounted.state.results = chatResults('сбор', ids)
      await nextTick()
      return { ...mounted, onGoToMessage }
    }

    it('показывают счётчик и сразу ведут к первому найденному', async () => {
      const { counter, onGoToMessage } = await searched(['a', 'b', 'c'])
      expect(counter()).toBe('1 из 3')
      expect(onGoToMessage).toHaveBeenCalledExactlyOnceWith({ messageId: 'a' })
    })

    it('стрелка вверх ведёт к более раннему сообщению (дальше по списку), вниз к более позднему', async () => {
      const { counter, button, onGoToMessage } = await searched(['new', 'mid', 'old'])
      button('Более раннее сообщение')?.click()
      await nextTick()
      expect(counter()).toBe('2 из 3')
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'mid' })
      button('Более позднее сообщение')?.click()
      await nextTick()
      expect(counter()).toBe('1 из 3')
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'new' })
    })

    it('по кругу: после последнего снова первое, а выше первого последнее', async () => {
      const { counter, button } = await searched(['a', 'b'])
      button('Более позднее сообщение')?.click()
      await nextTick()
      expect(counter()).toBe('2 из 2')
      button('Более раннее сообщение')?.click()
      await nextTick()
      expect(counter()).toBe('1 из 2')
    })

    it('Enter с тем же запросом листает результаты дальше', async () => {
      const { counter, pressEnter, onGoToMessage } = await searched(['a', 'b', 'c'])
      await pressEnter()
      expect(counter()).toBe('2 из 3')
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'b' })
    })

    it('если ничего не нашлось, так и пишет, а стрелки недоступны', async () => {
      const { counter, button, onGoToMessage } = await searched([])
      expect(counter()).toBe('Ничего не найдено')
      expect(button('Более раннее сообщение')?.disabled).toBe(true)
      expect(button('Более позднее сообщение')?.disabled).toBe(true)
      expect(onGoToMessage).not.toHaveBeenCalled()
    })

    it('пока результатов нет, стрелки недоступны, а счётчика нет', () => {
      const { counter, button } = mount()
      expect(counter()).toBe('')
      expect(button('Более раннее сообщение')?.disabled).toBe(true)
    })

    it('результаты на другой запрос игнорируются', async () => {
      const onGoToMessage = vi.fn()
      const { type, state, counter } = mount({}, { onGoToMessage })
      await type('сбор')
      await vi.advanceTimersByTimeAsync(300)
      state.results = chatResults('реквизит', ['a'])
      await nextTick()
      expect(counter()).toBe('')
      expect(onGoToMessage).not.toHaveBeenCalled()
    })

    it('общие результаты (по всем чатам) игнорируются', async () => {
      const onGoToMessage = vi.fn()
      const { type, state, counter } = mount({}, { onGoToMessage })
      await type('сбор')
      await vi.advanceTimersByTimeAsync(300)
      state.results = { scope: 'global', query: 'сбор', messages: [], users: [], chats: [] }
      await nextTick()
      expect(counter()).toBe('')
      expect(onGoToMessage).not.toHaveBeenCalled()
    })

    it('после изменения запроса прежние результаты пропадают, а новые начинаются с первого', async () => {
      const { type, state, counter, button, onGoToMessage } = await searched(['a', 'b', 'c'])
      button('Более раннее сообщение')?.click()
      await nextTick()
      await type('сбор в 8')
      await vi.advanceTimersByTimeAsync(300)
      // новый запрос ушёл, а ответа на него ещё нет: старые результаты уже не показываются
      expect(counter()).toBe('')
      state.results = chatResults('сбор в 8', ['x', 'y'])
      await nextTick()
      expect(counter()).toBe('1 из 2')
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'x' })
    })

    it('очистка поля сбрасывает результаты', async () => {
      const { type, counter } = await searched(['a', 'b'])
      await type('')
      expect(counter()).toBe('')
    })

    it('пока движок ищет, вместо счётчика индикатор', () => {
      const { container, counter } = mount({ isLoading: true })
      expect(container.querySelector('.chat-spinner')).not.toBeNull()
      expect(counter()).toBe('')
    })
  })

  describe('закрытие', () => {
    it('крестик закрывает поиск', () => {
      const onClose = vi.fn()
      mount({}, { onClose }).button('Закрыть поиск')?.click()
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('Esc закрывает поиск', () => {
      const onClose = vi.fn()
      const { field } = mount({}, { onClose })
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('после закрытия отложенный запрос не уходит', async () => {
      const onSearch = vi.fn()
      const { type } = mount({}, { onSearch })
      await type('сбор')
      app?.unmount()
      app = undefined
      await vi.advanceTimersByTimeAsync(500)
      expect(onSearch).not.toHaveBeenCalled()
    })
  })
})
