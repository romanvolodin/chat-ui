import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import type { PinnedMessage } from '../../types'
import PinnedMessagesBar from './PinnedMessagesBar.vue'

const pin = (id: string, text: string): PinnedMessage => ({
  messageId: id,
  excerpt: { authorId: 'ivan', text: [{ text }] },
})
const one = [pin('m1', 'Сбор в 8:00')]
const three = [
  pin('m1', 'Сбор в 8:00'),
  pin('m2', 'Реквизит привезут заранее'),
  pin('m3', 'Адрес площадки'),
]

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
})

function mount(pinned: PinnedMessage[], handlers: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  const state = reactive({ pinned })
  app = createApp({ render: () => h(PinnedMessagesBar, { pinned: state.pinned, ...handlers }) })
  app.mount(container)
  const title = () => container.querySelector('.chat-pinned-bar__title')?.textContent
  const text = () => container.querySelector('.chat-pinned-bar__text')?.textContent
  const click = async () => {
    container.querySelector<HTMLElement>('.chat-pinned-bar__main')?.click()
    await nextTick()
  }
  const activeMarks = () =>
    Array.from(container.querySelectorAll('.chat-pinned-bar__mark')).map((mark) =>
      mark.classList.contains('chat-pinned-bar__mark--active'),
    )
  return { container, state, title, text, click, activeMarks }
}

describe('PinnedMessagesBar', () => {
  it('без закреплённых ничего не рисует', () => {
    expect(mount([]).container.querySelector('.chat-pinned-bar')).toBeNull()
  })

  describe('одно закреплённое сообщение', () => {
    it('показывает название и текст', () => {
      const { title, text } = mount(one)
      expect(title()).toBe('Закреплённое сообщение')
      expect(text()).toBe('Сбор в 8:00')
    })

    it('для вложения без текста показывает его вид', () => {
      const { text } = mount([
        { messageId: 'm1', excerpt: { authorId: 'ivan', contentKind: 'image' } },
      ])
      expect(text()).toBe('Фото')
    })

    it('нажатие ведёт к сообщению и остаётся на нём', async () => {
      const onGoToMessage = vi.fn()
      const { click, title } = mount(one, { onGoToMessage })
      await click()
      await click()
      expect(onGoToMessage).toHaveBeenCalledTimes(2)
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'm1' })
      expect(title()).toBe('Закреплённое сообщение')
    })

    it('одна отметка слева', () => {
      expect(mount(one).activeMarks()).toEqual([true])
    })
  })

  describe('несколько закреплённых', () => {
    it('показывает первое с номером', () => {
      const { title, text } = mount(three)
      expect(title()).toBe('Закреплённое сообщение #1')
      expect(text()).toBe('Сбор в 8:00')
    })

    it('нажатие ведёт к показанному сообщению, а полоса переключается на следующее', async () => {
      const onGoToMessage = vi.fn()
      const { click, title, text } = mount(three, { onGoToMessage })
      await click()
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'm1' })
      expect(title()).toBe('Закреплённое сообщение #2')
      expect(text()).toBe('Реквизит привезут заранее')
      await click()
      expect(onGoToMessage).toHaveBeenLastCalledWith({ messageId: 'm2' })
      expect(title()).toBe('Закреплённое сообщение #3')
    })

    it('после последнего возвращается к первому', async () => {
      const { click, title } = mount(three)
      await click()
      await click()
      await click()
      expect(title()).toBe('Закреплённое сообщение #1')
    })

    it('отметок столько же, сколько закреплённых, и выделена текущая', async () => {
      const { click, activeMarks } = mount(three)
      expect(activeMarks()).toEqual([true, false, false])
      await click()
      expect(activeMarks()).toEqual([false, true, false])
    })

    it('при многих закреплённых отметок не больше четырёх', async () => {
      const many = Array.from({ length: 10 }, (_, index) =>
        pin(`m${String(index)}`, `Закреп ${String(index)}`),
      )
      const { activeMarks, click } = mount(many)
      expect(activeMarks()).toHaveLength(4)
      expect(activeMarks()).toEqual([true, false, false, false])
      for (let index = 0; index < 9; index++) await click()
      expect(activeMarks()).toEqual([false, false, false, true])
    })

    it('если закреплённых стало меньше, остаётся в пределах списка', async () => {
      const { click, state, title } = mount(three)
      await click()
      await click()
      expect(title()).toBe('Закреплённое сообщение #3')
      state.pinned = [pin('m1', 'Сбор в 8:00')]
      await nextTick()
      expect(title()).toBe('Закреплённое сообщение')
    })
  })

  it('кнопка справа открывает чат закреплённых сообщений', () => {
    const onOpenPinned = vi.fn()
    const { container } = mount(three, { onOpenPinned })
    const button = container.querySelector<HTMLElement>('.chat-icon-button')
    expect(button?.getAttribute('aria-label')).toBe('Закреплённые сообщения')
    button?.click()
    expect(onOpenPinned).toHaveBeenCalledOnce()
  })

  it('кнопка справа не меняет показанное сообщение', async () => {
    const { container, title } = mount(three, { onOpenPinned: vi.fn() })
    container.querySelector<HTMLElement>('.chat-icon-button')?.click()
    await nextTick()
    expect(title()).toBe('Закреплённое сообщение #1')
  })
})
