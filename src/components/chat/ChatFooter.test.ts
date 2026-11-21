import { afterEach, describe, expect, it, vi } from 'vitest'
import { channelChat } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { ChatFooter as Footer, OpenChat } from '../../types'
import ChatFooter from './ChatFooter.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(footer: Footer, extra: Partial<OpenChat> = {}, handlers = {}) {
  const chat: OpenChat = { ...channelChat, footer, messages: [], ...extra }
  mounted = mountWithChatContext(ChatFooter, { chat, ...handlers })
  return mounted.container
}

describe('ChatFooter', () => {
  describe('поле ввода', () => {
    it('рисует поле ввода без панели действий', () => {
      const container = mount({ type: 'input' })
      expect(container.querySelector('.chat-composer')).not.toBeNull()
      expect(container.querySelector('.chat-footer-action')).toBeNull()
    })

    it('показывает черновик из данных чата', () => {
      const container = mount({ type: 'input' }, { draft: [{ text: 'Недописанное' }] })
      expect(container.querySelector('textarea')?.value).toBe('Недописанное')
    })

    it('сообщает об изменении черновика', () => {
      const onChangeDraft = vi.fn()
      const container = mount({ type: 'input' }, {}, { onChangeDraft })
      const field = container.querySelector('textarea')
      if (!field) throw new Error('Нет поля ввода')
      field.value = 'При'
      field.dispatchEvent(new Event('input'))
      expect(onChangeDraft).toHaveBeenCalledWith({ text: [{ text: 'При' }] })
    })

    it('сообщает об отправке', () => {
      const onSendMessage = vi.fn()
      const container = mount({ type: 'input' }, { draft: [{ text: 'Привет' }] }, { onSendMessage })
      container.querySelector<HTMLElement>('.chat-composer__send')?.click()
      expect(onSendMessage).toHaveBeenCalledWith({ text: [{ text: 'Привет' }] })
    })
  })

  describe('кнопка звука', () => {
    it('у чата со звуком предлагает отключить его и сообщает об этом', () => {
      const onSetChatMuted = vi.fn()
      const container = mount({ type: 'mute' }, { isMuted: false }, { onSetChatMuted })
      const button = container.querySelector<HTMLElement>('.chat-footer-action')
      expect(button?.textContent).toBe('Отключить звук')
      button?.click()
      expect(onSetChatMuted).toHaveBeenCalledWith({ chatId: channelChat.id, isMuted: true })
    })

    it('у чата без звука предлагает включить его и сообщает об этом', () => {
      const onSetChatMuted = vi.fn()
      const container = mount({ type: 'mute' }, { isMuted: true }, { onSetChatMuted })
      const button = container.querySelector<HTMLElement>('.chat-footer-action')
      expect(button?.textContent).toBe('Включить звук')
      button?.click()
      expect(onSetChatMuted).toHaveBeenCalledWith({ chatId: channelChat.id, isMuted: false })
    })
  })

  it('«Присоединиться» сообщает об этом', () => {
    const onJoinChat = vi.fn()
    const container = mount({ type: 'join' }, {}, { onJoinChat })
    const button = container.querySelector<HTMLElement>('.chat-footer-action')
    expect(button?.textContent).toBe('Присоединиться')
    button?.click()
    expect(onJoinChat).toHaveBeenCalledWith({ chatId: channelChat.id })
  })

  it('«Открепить все сообщения» сообщает об этом', () => {
    const onUnpinAllMessages = vi.fn()
    const container = mount({ type: 'unpinAll' }, {}, { onUnpinAllMessages })
    const button = container.querySelector<HTMLElement>('.chat-footer-action')
    expect(button?.textContent).toBe('Открепить все сообщения')
    button?.click()
    expect(onUnpinAllMessages).toHaveBeenCalledWith({ chatId: channelChat.id })
  })

  describe('только чтение', () => {
    it('показывает текст из данных', () => {
      const container = mount({ type: 'readOnly', text: 'Писать могут только админы' })
      expect(container.querySelector('.chat-read-only-notice')?.textContent).toBe(
        'Писать могут только админы',
      )
    })

    it('без текста показывает стандартную формулировку', () => {
      const container = mount({ type: 'readOnly' })
      expect(container.querySelector('.chat-read-only-notice')?.textContent).toBe(
        'Вы не можете писать сообщения',
      )
    })

    it('не рисует кнопок', () => {
      expect(mount({ type: 'readOnly' }).querySelector('button')).toBeNull()
    })
  })
})
