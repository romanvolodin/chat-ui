import { afterEach, describe, expect, it, vi } from 'vitest'
import { channelChat, pinnedChat } from '../../docs/sampleData'
import { sampleMessages } from '../../docs/sampleMessages'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { OpenChat } from '../../types'
import ChatView from './ChatView.vue'

const chat: OpenChat = { ...pinnedChat, footer: { type: 'input' }, messages: [] }

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

describe('ChatView', () => {
  it('показывает шапку открытого чата', () => {
    mounted = mountWithChatContext(ChatView, { chat })
    expect(mounted.container.querySelector('.chat-header__title')?.textContent).toBe('Иван Петров')
  })

  it('передаёт наружу закрытие чата из шапки', () => {
    const onCloseChat = vi.fn()
    mounted = mountWithChatContext(ChatView, { chat, onCloseChat })
    mounted.container.querySelector<HTMLElement>('.chat-header__back button')?.click()
    expect(onCloseChat).toHaveBeenCalledOnce()
  })

  it('показывает нижнюю панель и передаёт наружу её действия', () => {
    const onJoinChat = vi.fn()
    const channel: OpenChat = { ...channelChat, footer: { type: 'join' }, messages: [] }
    mounted = mountWithChatContext(ChatView, { chat: channel, onJoinChat })
    mounted.container.querySelector<HTMLElement>('.chat-footer-action')?.click()
    expect(onJoinChat).toHaveBeenCalledWith({ chatId: channelChat.id })
  })

  describe('список сообщений', () => {
    const withMessages = (extra: Partial<OpenChat> = {}): OpenChat => ({
      ...chat,
      messages: sampleMessages,
      ...extra,
    })

    it('показывает сообщения между шапкой и нижней панелью', () => {
      const channel: OpenChat = { ...withMessages(), footer: { type: 'join' } }
      mounted = mountWithChatContext(ChatView, { chat: channel })
      const view = mounted.container.querySelector('.chat-view')
      const order = Array.from(view?.children ?? []).map((element) => element.className)
      expect(order).toEqual([
        'chat-header',
        'chat-message-list',
        expect.stringContaining('chat-footer') as string,
      ])
      expect(view?.querySelectorAll('.chat-bubble').length).toBeGreaterThan(0)
    })

    it('если ниже есть непоказанные сообщения, кнопка «вниз» просит последние', () => {
      const onGoToLatest = vi.fn()
      mounted = mountWithChatContext(ChatView, {
        chat: withMessages({ hasMoreAfter: true }),
        onGoToLatest,
      })
      mounted.container.querySelector<HTMLElement>('.chat-scroll-down')?.click()
      expect(onGoToLatest).toHaveBeenCalledOnce()
    })

    it('просит порцию ниже, когда она нужна', () => {
      const onReachedBottom = vi.fn()
      mounted = mountWithChatContext(ChatView, {
        chat: withMessages({ hasMoreAfter: true }),
        onReachedBottom,
      })
      expect(onReachedBottom).toHaveBeenCalledWith({ list: 'messages' })
    })

    it('показывает индикатор загрузки истории', () => {
      mounted = mountWithChatContext(ChatView, {
        chat: withMessages({ hasMoreBefore: true }),
        isLoadingMessages: true,
      })
      expect(mounted.container.querySelector('.chat-message-list__loading--top')).not.toBeNull()
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
      mounted = mountWithChatContext(ChatView, {
        chat: withMessages({ firstUnreadMessageId: 'm190' }),
        onReadUntil,
      })
      await vi.advanceTimersByTimeAsync(200)
      // все сообщения «видны», значит дочитано до последнего
      expect(onReadUntil).toHaveBeenCalledWith({ messageId: 'm200' })
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    it('передаёт наружу открытие пользователя из упоминания', () => {
      const onOpenUser = vi.fn()
      const mention: OpenChat = {
        ...chat,
        messages: [
          {
            type: 'user',
            id: '1',
            authorId: 'ivan',
            sentAt: new Date('2026-11-17T12:00:00Z'),
            text: [{ text: '@Анна', format: ['mention'], userId: 'anna' }],
          },
        ],
      }
      mounted = mountWithChatContext(ChatView, { chat: mention, onOpenUser })
      mounted.container.querySelector<HTMLElement>('.chat-text-mention')?.click()
      expect(onOpenUser).toHaveBeenCalledWith({ userId: 'anna' })
    })
  })

  describe('поле ввода', () => {
    const typeInto = (container: HTMLElement, value: string) => {
      const field = container.querySelector('textarea')
      if (!field) throw new Error('Нет поля ввода')
      field.value = value
      field.dispatchEvent(new Event('input'))
    }

    it('показывает черновик чата', () => {
      mounted = mountWithChatContext(ChatView, { chat: { ...chat, draft: [{ text: 'Черновик' }] } })
      expect(mounted.container.querySelector('textarea')?.value).toBe('Черновик')
    })

    it('передаёт наружу изменение черновика', () => {
      const onChangeDraft = vi.fn()
      mounted = mountWithChatContext(ChatView, { chat, onChangeDraft })
      typeInto(mounted.container, 'При')
      expect(onChangeDraft).toHaveBeenCalledWith({ text: [{ text: 'При' }] })
    })

    it('передаёт наружу отправку сообщения', () => {
      const onSendMessage = vi.fn()
      mounted = mountWithChatContext(ChatView, {
        chat: { ...chat, draft: [{ text: 'Привет' }] },
        onSendMessage,
      })
      mounted.container.querySelector<HTMLElement>('.chat-composer__send')?.click()
      expect(onSendMessage).toHaveBeenCalledWith({ text: [{ text: 'Привет' }] })
    })
  })
})
