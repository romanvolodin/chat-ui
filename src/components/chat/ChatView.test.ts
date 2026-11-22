import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { channelChat, pinnedChat } from '../../docs/sampleData'
import { sampleMessages } from '../../docs/sampleMessages'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { Message, OpenChat } from '../../types'
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

  describe('действия над сообщением из меню', () => {
    const at = new Date('2026-11-17T12:00:00Z')
    const theirs: Message = {
      type: 'user',
      id: 'theirs',
      authorId: 'ivan',
      sentAt: at,
      text: [{ text: 'Завтра сбор в 8:00' }],
    }
    const mine: Message = {
      type: 'user',
      id: 'mine',
      authorId: 'me',
      sentAt: at,
      status: 'read',
      text: [{ text: 'Принято' }],
    }
    const conversation: OpenChat = { ...chat, messages: [theirs, mine] }

    const mountChat = (handlers: Record<string, unknown> = {}) => {
      mounted = mountWithChatContext(ChatView, { chat: conversation, ...handlers })
      return mounted.container
    }
    const choose = async (container: HTMLElement, messageId: string, label: string) => {
      container.querySelector(`.chat-bubble[data-message-id="${messageId}"]`)?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: 40,
          clientY: 40,
        }),
      )
      await nextTick()
      const item = Array.from(container.querySelectorAll<HTMLElement>('.chat-menu__item')).find(
        (candidate) => candidate.textContent.trim() === label,
      )
      if (!item) throw new Error(`Нет пункта «${label}»`)
      item.click()
      await nextTick()
    }
    const typeInto = async (container: HTMLElement, value: string) => {
      const field = container.querySelector('textarea')
      if (!field) throw new Error('Нет поля ввода')
      field.value = value
      field.dispatchEvent(new Event('input'))
      await nextTick()
    }

    it('«Ответить» включает в поле ввода режим ответа с именем автора и цитатой', async () => {
      const container = mountChat()
      await choose(container, 'theirs', 'Ответить')
      expect(container.querySelector('.chat-composer-reply__title')?.textContent).toBe(
        'Ответ Иван Петров',
      )
      expect(container.querySelector('.chat-composer-reply__text')?.textContent).toBe(
        'Завтра сбор в 8:00',
      )
    })

    it('ответ уходит вместе со ссылкой на исходное сообщение, и режим заканчивается', async () => {
      const onSendMessage = vi.fn()
      const container = mountChat({ onSendMessage })
      await choose(container, 'theirs', 'Ответить')
      await typeInto(container, 'Принято')
      container.querySelector<HTMLElement>('.chat-composer__send')?.click()
      await nextTick()
      expect(onSendMessage).toHaveBeenCalledWith({
        text: [{ text: 'Принято' }],
        replyTo: { messageId: 'theirs' },
      })
      expect(container.querySelector('.chat-composer-reply')).toBeNull()
    })

    it('крестик на плашке отменяет ответ', async () => {
      const container = mountChat()
      await choose(container, 'theirs', 'Ответить')
      container.querySelector<HTMLElement>('.chat-composer-reply button')?.click()
      await nextTick()
      expect(container.querySelector('.chat-composer-reply')).toBeNull()
    })

    it('«Изменить» кладёт текст сообщения в поле, а отправка уходит как редактирование', async () => {
      const onEditMessage = vi.fn()
      const onSendMessage = vi.fn()
      const container = mountChat({ onEditMessage, onSendMessage })
      await choose(container, 'mine', 'Изменить')
      expect(container.querySelector('.chat-composer-reply__title')?.textContent).toBe(
        'Редактирование',
      )
      expect(container.querySelector('textarea')?.value).toBe('Принято')
      await typeInto(container, 'Принято, буду')
      container.querySelector<HTMLElement>('.chat-composer__send')?.click()
      await nextTick()
      expect(onEditMessage).toHaveBeenCalledWith({
        messageId: 'mine',
        text: [{ text: 'Принято, буду' }],
      })
      expect(onSendMessage).not.toHaveBeenCalled()
      expect(container.querySelector('.chat-composer-reply')).toBeNull()
    })

    it('«Закрепить» сообщает движку новое значение', async () => {
      const onSetMessagePinned = vi.fn()
      const container = mountChat({ onSetMessagePinned })
      await choose(container, 'theirs', 'Закрепить')
      expect(onSetMessagePinned).toHaveBeenCalledWith({ messageId: 'theirs', isPinned: true })
    })

    it('«Получить ссылку» сообщает движку об этом', async () => {
      const onGetLink = vi.fn()
      const container = mountChat({ onGetLink })
      await choose(container, 'theirs', 'Получить ссылку')
      expect(onGetLink).toHaveBeenCalledWith({ messageId: 'theirs' })
    })

    describe('удаление', () => {
      const confirm = async (container: HTMLElement) => {
        const button = Array.from(container.querySelectorAll<HTMLElement>('.chat-button')).find(
          (candidate) => candidate.textContent.trim() === 'Удалить',
        )
        button?.click()
        await nextTick()
      }

      it('«Удалить» сначала спрашивает подтверждение и ничего не отправляет', async () => {
        const onDeleteMessages = vi.fn()
        const container = mountChat({ onDeleteMessages })
        await choose(container, 'theirs', 'Удалить')
        expect(container.querySelector('.chat-modal__title')?.textContent).toBe(
          'Удалить сообщение?',
        )
        expect(onDeleteMessages).not.toHaveBeenCalled()
      })

      it('чужое сообщение удаляется только у себя', async () => {
        const onDeleteMessages = vi.fn()
        const container = mountChat({ onDeleteMessages })
        await choose(container, 'theirs', 'Удалить')
        expect(container.querySelector('input[type="checkbox"]')).toBeNull()
        await confirm(container)
        expect(onDeleteMessages).toHaveBeenCalledExactlyOnceWith({
          messageIds: ['theirs'],
          scope: 'self',
        })
      })

      it('своё сообщение можно удалить у всех', async () => {
        const onDeleteMessages = vi.fn()
        const container = mountChat({ onDeleteMessages })
        await choose(container, 'mine', 'Удалить')
        const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
        if (!checkbox) throw new Error('Нет выбора «у всех»')
        checkbox.checked = true
        checkbox.dispatchEvent(new Event('change'))
        await nextTick()
        await confirm(container)
        expect(onDeleteMessages).toHaveBeenCalledWith({ messageIds: ['mine'], scope: 'everyone' })
      })

      it('отмена закрывает окно и ничего не отправляет', async () => {
        const onDeleteMessages = vi.fn()
        const container = mountChat({ onDeleteMessages })
        await choose(container, 'theirs', 'Удалить')
        const cancel = Array.from(container.querySelectorAll<HTMLElement>('.chat-button')).find(
          (candidate) => candidate.textContent.trim() === 'Отмена',
        )
        cancel?.click()
        await nextTick()
        // Окно уходит плавно: в тестах переход не завершается, поэтому смотрим на его начало
        const modal = container.querySelector('.chat-modal')
        expect(modal === null || modal.classList.contains('chat-modal-leave-active')).toBe(true)
        expect(onDeleteMessages).not.toHaveBeenCalled()
      })
    })
  })
})
