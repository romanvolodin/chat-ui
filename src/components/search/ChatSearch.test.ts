import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import ChatSearch from './ChatSearch.vue'

let app: App | undefined

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  app?.unmount()
  app = undefined
  vi.useRealTimers()
})

function mount() {
  const onSearch = vi.fn()
  const props = reactive({
    modelValue: '',
    'onUpdate:modelValue': (value: string) => {
      props.modelValue = value
    },
    onSearch,
  })
  const container = document.createElement('div')
  app = createApp({ render: () => h(ChatSearch, props) })
  app.mount(container)
  const field = container.querySelector<HTMLInputElement>('.chat-search-input__field')
  if (!field) throw new Error('нет поля поиска')
  const type = async (text: string) => {
    field.value = text
    field.dispatchEvent(new Event('input'))
    await nextTick()
  }
  const pressEnter = () => {
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
  }
  return { onSearch, type, pressEnter, props }
}

describe('ChatSearch', () => {
  it('отправляет запрос через 300 мс после ввода', async () => {
    const { onSearch, type } = mount()
    await type('кни')
    vi.advanceTimersByTime(299)
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'кни', scope: 'global' })
  })

  it('при быстром вводе отправляет только последний запрос', async () => {
    const { onSearch, type } = mount()
    await type('к')
    vi.advanceTimersByTime(200)
    await type('кн')
    vi.advanceTimersByTime(200)
    await type('кни')
    vi.advanceTimersByTime(300)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'кни', scope: 'global' })
  })

  it('отправляет текст как есть, без обрезки пробелов и смены регистра', async () => {
    const { onSearch, type } = mount()
    await type('  Кни ')
    vi.advanceTimersByTime(300)
    expect(onSearch).toHaveBeenCalledWith({ query: '  Кни ', scope: 'global' })
  })

  it('по Enter отправляет сразу и не дублирует отложенную отправку', async () => {
    const { onSearch, type, pressEnter } = mount()
    await type('кни')
    pressEnter()
    expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'кни', scope: 'global' })
    vi.advanceTimersByTime(1000)
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it('по Enter повторяет запрос, уже отправленный по паузе', async () => {
    const { onSearch, type, pressEnter } = mount()
    await type('кни')
    vi.advanceTimersByTime(300)
    pressEnter()
    expect(onSearch).toHaveBeenCalledTimes(2)
  })

  it('пустой запрос и пробелы ничего не отправляют', async () => {
    const { onSearch, type, pressEnter } = mount()
    await type('   ')
    pressEnter()
    vi.advanceTimersByTime(1000)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('очистка поля отменяет ожидающую отправку', async () => {
    const { onSearch, type } = mount()
    await type('кни')
    vi.advanceTimersByTime(100)
    await type('')
    vi.advanceTimersByTime(1000)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('не отправляет ничего после размонтирования', async () => {
    const { onSearch, type } = mount()
    await type('кни')
    app?.unmount()
    app = undefined
    vi.advanceTimersByTime(1000)
    expect(onSearch).not.toHaveBeenCalled()
  })
})
