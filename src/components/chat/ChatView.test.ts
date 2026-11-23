import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
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

  describe('полоса закреплённых', () => {
    const pinnedChat = (extra: Partial<OpenChat> = {}): OpenChat => ({
      ...chat,
      messages: [
        {
          type: 'user',
          id: 'near',
          authorId: 'ivan',
          sentAt: new Date('2026-11-17T12:00:00Z'),
          text: [{ text: 'Рядом' }],
        },
      ],
      pinned: [
        {
          messageId: 'far',
          excerpt: { authorId: 'ivan', text: [{ text: 'Далёкое закреплённое' }] },
        },
        { messageId: 'near', excerpt: { authorId: 'ivan', text: [{ text: 'Рядом' }] } },
      ],
      ...extra,
    })
    const bar = (container: HTMLElement) => container.querySelector('.chat-pinned-bar')

    it('стоит между шапкой и сообщениями', () => {
      mounted = mountWithChatContext(ChatView, { chat: pinnedChat() })
      const view = mounted.container.querySelector('.chat-view')
      const order = Array.from(view?.children ?? []).map((element) => element.className)
      expect(order.slice(0, 3)).toEqual(['chat-header', 'chat-pinned-bar', 'chat-message-list'])
    })

    it('без закреплённых полосы нет', () => {
      mounted = mountWithChatContext(ChatView, { chat: pinnedChat({ pinned: undefined }) })
      expect(bar(mounted.container)).toBeNull()
    })

    it('нажатие на далёкое закреплённое просит движок перейти к нему', () => {
      const onGoToMessage = vi.fn()
      mounted = mountWithChatContext(ChatView, { chat: pinnedChat(), onGoToMessage })
      mounted.container.querySelector<HTMLElement>('.chat-pinned-bar__main')?.click()
      expect(onGoToMessage).toHaveBeenCalledExactlyOnceWith({ messageId: 'far' })
    })

    it('нажатие на загруженное закреплённое показывает его само и подсвечивает', async () => {
      const onGoToMessage = vi.fn()
      mounted = mountWithChatContext(ChatView, { chat: pinnedChat(), onGoToMessage })
      const main = mounted.container.querySelector<HTMLElement>('.chat-pinned-bar__main')
      main?.click()
      await nextTick()
      main?.click()
      await nextTick()
      await nextTick()
      expect(onGoToMessage).toHaveBeenCalledOnce()
      expect(
        mounted.container
          .querySelector('.chat-bubble--highlighted')
          ?.getAttribute('data-message-id'),
      ).toBe('near')
    })

    it('кнопка справа просит открыть чат закреплённых сообщений', () => {
      const onOpenPinned = vi.fn()
      mounted = mountWithChatContext(ChatView, { chat: pinnedChat(), onOpenPinned })
      mounted.container.querySelector<HTMLElement>('.chat-pinned-bar .chat-icon-button')?.click()
      expect(onOpenPinned).toHaveBeenCalledExactlyOnceWith({ chatId: chat.id })
    })
  })

  describe('поиск по чату', () => {
    const near: Message = {
      type: 'user',
      id: 'near',
      authorId: 'ivan',
      sentAt: new Date('2026-11-17T12:00:00Z'),
      text: [{ text: 'Сбор в 8:00' }],
    }
    const searchable: OpenChat = { ...chat, messages: [near] }
    const openSearch = async (container: HTMLElement) => {
      container.querySelector<HTMLElement>('button[aria-label="Поиск по чату"]')?.click()
      await nextTick()
    }
    const searchFor = async (container: HTMLElement, query: string) => {
      const field = container.querySelector<HTMLInputElement>('.chat-search-input__field')
      if (!field) throw new Error('Нет поля поиска')
      field.value = query
      field.dispatchEvent(new Event('input'))
      await nextTick()
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
      await nextTick()
    }

    it('по умолчанию поиска нет, лупа в шапке его открывает и ставит курсор в поле', async () => {
      mounted = mountWithChatContext(ChatView, { chat: searchable })
      expect(mounted.container.querySelector('.chat-search-bar')).toBeNull()
      await openSearch(mounted.container)
      expect(mounted.container.querySelector('.chat-search-bar')).not.toBeNull()
      expect(document.activeElement).toBe(
        mounted.container.querySelector('.chat-search-input__field'),
      )
    })

    it('строка поиска стоит сразу под шапкой', async () => {
      mounted = mountWithChatContext(ChatView, { chat: searchable })
      await openSearch(mounted.container)
      const view = mounted.container.querySelector('.chat-view')
      const order = Array.from(view?.children ?? []).map((element) => element.className)
      expect(order.slice(0, 2)).toEqual(['chat-header', 'chat-search-bar'])
    })

    it('запрос уходит наружу с областью «чат»', async () => {
      const onSearch = vi.fn()
      mounted = mountWithChatContext(ChatView, { chat: searchable, onSearch })
      await openSearch(mounted.container)
      await searchFor(mounted.container, 'сбор')
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({ query: 'сбор', scope: 'chat' })
    })

    it('найденное загруженное сообщение показывает само и подсвечивает', async () => {
      const props = reactive<Record<string, unknown>>({ chat: searchable })
      mounted = mountWithChatContext(ChatView, props)
      await openSearch(mounted.container)
      await searchFor(mounted.container, 'сбор')
      props.searchResults = { scope: 'chat', query: 'сбор', messageIds: ['near'] }
      // подсветка включается на следующем такте после перехода, поэтому ждём чуть дольше
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(
        mounted.container
          .querySelector('.chat-bubble--highlighted')
          ?.getAttribute('data-message-id'),
      ).toBe('near')
      expect(mounted.container.querySelector('.chat-search-bar__status')?.textContent.trim()).toBe(
        '1 из 1',
      )
    })

    it('найденное далёкое сообщение просит у движка', async () => {
      const onGoToMessage = vi.fn()
      const props = reactive<Record<string, unknown>>({ chat: searchable, onGoToMessage })
      mounted = mountWithChatContext(ChatView, props)
      await openSearch(mounted.container)
      await searchFor(mounted.container, 'сбор')
      props.searchResults = { scope: 'chat', query: 'сбор', messageIds: ['far'] }
      await nextTick()
      expect(onGoToMessage).toHaveBeenCalledExactlyOnceWith({ messageId: 'far' })
    })

    it('пока движок ищет, показывает индикатор', async () => {
      mounted = mountWithChatContext(ChatView, { chat: searchable, isSearchLoading: true })
      await openSearch(mounted.container)
      expect(mounted.container.querySelector('.chat-search-bar .chat-spinner')).not.toBeNull()
    })

    it('крестик закрывает строку поиска', async () => {
      mounted = mountWithChatContext(ChatView, { chat: searchable })
      await openSearch(mounted.container)
      mounted.container.querySelector<HTMLElement>('button[aria-label="Закрыть поиск"]')?.click()
      await nextTick()
      expect(mounted.container.querySelector('.chat-search-bar')).toBeNull()
    })
  })
})
