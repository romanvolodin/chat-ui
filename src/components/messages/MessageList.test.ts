import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { channelChat, groupChat, pinnedChat, sampleNow } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { Message, OpenChat } from '../../types'
import MessageList from './MessageList.vue'

const minute = 60_000
const userMessage = (id: string, authorId: string, minutesAgo: number): Message => ({
  type: 'user',
  id,
  authorId,
  sentAt: new Date(sampleNow.getTime() - minutesAgo * minute),
  text: [{ text: `Сообщение ${id}` }],
})

const baseChat: OpenChat = { ...pinnedChat, footer: { type: 'input' }, messages: [] }
const chatWith = (extra: Partial<OpenChat>): OpenChat => ({ ...baseChat, ...extra })

// В happy-dom нет раскладки, поэтому высоту области прокрутки считаем сами: основание плюс высота
// каждого пузыря. Так высота меняется вместе с DOM, как в браузере, а не в момент присваивания в тесте.
const BASE_HEIGHT = 500
const BUBBLE_HEIGHT = 300
const VIEWPORT_HEIGHT = 500

let mounted: ReturnType<typeof mountWithChatContext> | undefined

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return BASE_HEIGHT + this.querySelectorAll('.chat-bubble').length * BUBBLE_HEIGHT
  })
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(VIEWPORT_HEIGHT)
  // happy-dom не прокручивает сам: присваиваем scrollTop с ограничением, как делает браузер.
  // Подмена стоит до монтирования, потому что начальная прокрутка происходит при монтировании.
  vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(function (
    this: Element,
    options?: ScrollToOptions | number,
  ) {
    const element = this as HTMLElement
    const top = typeof options === 'object' ? (options.top ?? 0) : 0
    element.scrollTop = Math.min(top, element.scrollHeight - VIEWPORT_HEIGHT)
  })
})

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
  vi.restoreAllMocks()
})

const bottomOf = (scroller: HTMLElement) => scroller.scrollHeight - VIEWPORT_HEIGHT

function mount(chat: OpenChat, handlers: Record<string, unknown> = {}) {
  const props = reactive({ chat, ...handlers })
  mounted = mountWithChatContext(MessageList, props)
  const container = mounted.container
  const scroller = container.querySelector<HTMLElement>('.chat-message-list__scroller')
  if (!scroller) throw new Error('Нет области прокрутки')
  return { container, scroller, props }
}

describe('MessageList', () => {
  describe('лента', () => {
    it('рисует заголовок дня, а за ним сообщения', () => {
      const messages = [userMessage('1', 'ivan', 5), userMessage('2', 'ivan', 4)]
      const { container } = mount(chatWith({ messages }))
      expect(container.querySelector('.chat-date-divider')).not.toBeNull()
      expect(container.querySelectorAll('.chat-bubble')).toHaveLength(2)
      expect(container.querySelectorAll('.chat-message-group')).toHaveLength(1)
    })

    it('рисует системные сообщения', () => {
      const messages: Message[] = [
        { type: 'system', id: 's1', sentAt: sampleNow, text: [{ text: 'Начало обсуждения' }] },
      ]
      const { container } = mount(chatWith({ messages }))
      expect(container.querySelector('.chat-system-message')?.textContent.trim()).toBe(
        'Начало обсуждения',
      )
    })

    it('ставит метку непрочитанных перед первым непрочитанным', () => {
      const messages = [userMessage('1', 'ivan', 5), userMessage('2', 'ivan', 4)]
      const { container } = mount(chatWith({ messages, firstUnreadMessageId: '2' }))
      expect(container.querySelector('.chat-unread-divider')).not.toBeNull()
      expect(container.querySelectorAll('.chat-message-group')).toHaveLength(2)
    })

    it('исходящие сообщения определяет по текущему пользователю', () => {
      const messages = [userMessage('1', 'me', 5)]
      const { container } = mount(chatWith({ messages }))
      expect(container.querySelector('.chat-bubble--outgoing')).not.toBeNull()
    })

    it('пустой чат рисуется без сообщений и без кнопки «вниз»', () => {
      const { container } = mount(chatWith({ messages: [] }))
      expect(container.querySelector('.chat-bubble')).toBeNull()
      expect(container.querySelector('.chat-scroll-down')).toBeNull()
    })
  })

  describe('автор во входящих сообщениях', () => {
    const messages = [userMessage('1', 'ivan', 5), userMessage('2', 'me', 4)]

    it('в группе показывается у входящих и не показывается у исходящих', () => {
      const { container } = mount({ ...groupChat, footer: { type: 'input' }, messages })
      const groups = container.querySelectorAll('.chat-message-group')
      expect(groups[0]?.querySelector('.chat-message-group__author')).not.toBeNull()
      expect(groups[1]?.querySelector('.chat-message-group__author')).toBeNull()
    })

    it('в личном чате не показывается', () => {
      const { container } = mount(chatWith({ messages }))
      expect(container.querySelector('.chat-message-group__author')).toBeNull()
    })

    it('в канале не показывается', () => {
      const { container } = mount({ ...channelChat, footer: { type: 'mute' }, messages })
      expect(container.querySelector('.chat-message-group__author')).toBeNull()
    })
  })

  describe('начальная позиция', () => {
    it('без непрочитанных открывается внизу', () => {
      const { scroller } = mount(chatWith({ messages: [userMessage('1', 'ivan', 5)] }))
      expect(scroller.scrollTop).toBe(bottomOf(scroller))
    })

    it('с непрочитанными прокручивается к их метке', () => {
      const messages = [userMessage('1', 'ivan', 5), userMessage('2', 'ivan', 4)]
      const rect = (top: number) => ({ top }) as DOMRect
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element,
      ) {
        return this.classList.contains('chat-unread-divider') ? rect(900) : rect(100)
      })
      const { scroller } = mount(chatWith({ messages, firstUnreadMessageId: '2' }))
      // метка ниже верха области на 800px, минус отступ 8px
      expect(scroller.scrollTop).toBe(792)
    })
  })

  describe('кнопка «вниз»', () => {
    const scrollTo = async (scroller: HTMLElement, top: number) => {
      scroller.scrollTop = top
      scroller.dispatchEvent(new Event('scroll'))
      await nextTick()
    }

    it('внизу не показывается', () => {
      const { container } = mount(chatWith({ messages: [userMessage('1', 'ivan', 5)] }))
      expect(container.querySelector('.chat-scroll-down')).toBeNull()
    })

    it('при прокрутке вверх появляется, а при возврате вниз исчезает', async () => {
      const { container, scroller } = mount(chatWith({ messages: [userMessage('1', 'ivan', 5)] }))
      await scrollTo(scroller, 0)
      expect(container.querySelector('.chat-scroll-down')).not.toBeNull()
      await scrollTo(scroller, bottomOf(scroller))
      expect(container.querySelector('.chat-scroll-down')).toBeNull()
    })

    it('показывает число непрочитанных чата', async () => {
      const { container, scroller } = mount(
        chatWith({ messages: [userMessage('1', 'ivan', 5)], unreadCount: 3 }),
      )
      await scrollTo(scroller, 0)
      expect(container.querySelector('.chat-scroll-down .chat-badge')?.textContent.trim()).toBe('3')
    })

    it('нажатие прокручивает вниз', async () => {
      const { container, scroller } = mount(chatWith({ messages: [userMessage('1', 'ivan', 5)] }))
      await scrollTo(scroller, 0)
      container.querySelector<HTMLElement>('.chat-scroll-down')?.click()
      expect(scroller.scrollTop).toBe(bottomOf(scroller))
    })

    it('если ниже есть непоказанные сообщения, показывается даже внизу, а нажатие просит последние', () => {
      const onGoToLatest = vi.fn()
      const { container, scroller } = mount(
        chatWith({ messages: [userMessage('1', 'ivan', 5)], hasMoreAfter: true }),
        { onGoToLatest },
      )
      const button = container.querySelector<HTMLElement>('.chat-scroll-down')
      expect(button).not.toBeNull()
      scroller.scrollTop = 0
      button?.click()
      expect(onGoToLatest).toHaveBeenCalledOnce()
      expect(scroller.scrollTop).toBe(0)
    })
  })

  describe('изменение списка сообщений', () => {
    const scrollTo = async (scroller: HTMLElement, top: number) => {
      scroller.scrollTop = top
      scroller.dispatchEvent(new Event('scroll'))
      await nextTick()
    }

    it('новое сообщение внизу удерживает прокрутку внизу', async () => {
      const { scroller, props } = mount(chatWith({ messages: [userMessage('1', 'ivan', 5)] }))
      props.chat = chatWith({
        messages: [userMessage('1', 'ivan', 5), userMessage('2', 'ivan', 0)],
      })
      await nextTick()
      expect(scroller.scrollTop).toBe(bottomOf(scroller))
      expect(scroller.scrollTop).toBe(600)
    })

    it('новое сообщение не сдвигает прокрутку, если читают историю выше', async () => {
      const { scroller, props } = mount(chatWith({ messages: [userMessage('1', 'ivan', 5)] }))
      await scrollTo(scroller, 100)
      props.chat = chatWith({
        messages: [userMessage('1', 'ivan', 5), userMessage('2', 'ivan', 0)],
      })
      await nextTick()
      expect(scroller.scrollTop).toBe(100)
    })

    it('история, добавленная сверху, сохраняет место, где читают', async () => {
      const { scroller, props } = mount(chatWith({ messages: [userMessage('5', 'ivan', 5)] }))
      await scrollTo(scroller, 100)
      props.chat = chatWith({
        messages: [
          userMessage('3', 'ivan', 30),
          userMessage('4', 'ivan', 20),
          userMessage('5', 'ivan', 5),
        ],
      })
      await nextTick()
      // добавилось два пузыря по 300px
      expect(scroller.scrollTop).toBe(700)
    })

    it('история сверху оставляет внизу того, кто был внизу', async () => {
      const { scroller, props } = mount(chatWith({ messages: [userMessage('5', 'ivan', 5)] }))
      expect(scroller.scrollTop).toBe(bottomOf(scroller))
      props.chat = chatWith({
        messages: [userMessage('4', 'ivan', 20), userMessage('5', 'ivan', 5)],
      })
      await nextTick()
      expect(scroller.scrollTop).toBe(bottomOf(scroller))
    })
  })

  it('нажатие на упоминание сообщает об открытии пользователя', () => {
    const onOpenUser = vi.fn()
    const messages: Message[] = [
      {
        type: 'user',
        id: '1',
        authorId: 'ivan',
        sentAt: sampleNow,
        text: [{ text: '@Анна', format: ['mention'], userId: 'anna' }],
      },
    ]
    const { container } = mount(chatWith({ messages }), { onOpenUser })
    container.querySelector<HTMLElement>('.chat-text-mention')?.click()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'anna' })
  })
})
