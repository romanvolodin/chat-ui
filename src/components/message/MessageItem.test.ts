import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { sampleNow } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { UserMessage } from '../../types'
import MessageItem from './MessageItem.vue'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'ivan',
  sentAt: sampleNow,
  text: [{ text: 'Секретный текст' }],
}

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(
  props: Record<string, unknown> = {},
  slots?: Parameters<typeof mountWithChatContext>[2],
) {
  mounted = mountWithChatContext(MessageItem, { message, ...props }, slots)
  return mounted.container
}

describe('MessageItem', () => {
  it('рисует пузырь сообщения', () => {
    const container = mount()
    expect(container.querySelector('.chat-bubble')?.textContent).toContain('Секретный текст')
    expect(container.querySelector('.chat-hidden-stub')).toBeNull()
  })

  it('передаёт пузырю направление и положение в группе', () => {
    const bubble = mount({
      isOutgoing: true,
      isFirstInGroup: false,
      isLastInGroup: false,
    }).querySelector('.chat-bubble')
    expect(bubble?.classList.contains('chat-bubble--outgoing')).toBe(true)
    expect(bubble?.classList.contains('chat-bubble--joined-before')).toBe(true)
    expect(bubble?.classList.contains('chat-bubble--joined-after')).toBe(true)
  })

  it('передаёт слот шапки пузырю', () => {
    const container = mount({}, { header: () => h('span', { class: 'author' }, 'Иван') })
    expect(container.querySelector('.chat-bubble__header .author')?.textContent).toBe('Иван')
  })

  it('без слота шапки её нет', () => {
    expect(mount().querySelector('.chat-bubble__header')).toBeNull()
  })

  describe('заблокированный автор', () => {
    const blocked = { message: { ...message, authorId: 'blocked' } }

    it('вместо пузыря показывает заглушку', () => {
      const container = mount(blocked)
      expect(container.querySelector('.chat-bubble')).toBeNull()
      expect(container.querySelector('.chat-hidden-stub')?.textContent).toBe('Сообщение скрыто')
    })

    it('не выводит текст сообщения', () => {
      expect(mount(blocked).textContent).not.toContain('Секретный текст')
    })

    it('сохраняет id сообщения, чтобы к нему можно было перейти', () => {
      expect(
        mount(blocked).querySelector('[data-message-id]')?.getAttribute('data-message-id'),
      ).toBe('m1')
    })
  })

  it('автора нет в справочнике: сообщение показывается', () => {
    expect(
      mount({ message: { ...message, authorId: 'nobody' } }).querySelector('.chat-bubble'),
    ).not.toBeNull()
  })

  it('передаёт наружу открытие пользователя из упоминания', () => {
    const onOpenUser = vi.fn()
    const container = mount({
      message: { ...message, text: [{ text: '@Анна', format: ['mention'], userId: 'anna' }] },
      onOpenUser,
    })
    container.querySelector<HTMLElement>('.chat-text-mention')?.click()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'anna' })
  })

  it('передаёт наружу переход по цитате', () => {
    const onGoToMessage = vi.fn()
    const container = mount({
      message: {
        ...message,
        replyTo: { messageId: 'm0', excerpt: { authorId: 'anna', text: [{ text: 'Исходное' }] } },
      },
      onGoToMessage,
    })
    container.querySelector<HTMLElement>('.chat-reply-quote')?.click()
    expect(onGoToMessage).toHaveBeenCalledWith({ messageId: 'm0' })
  })
})
