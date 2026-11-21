import { afterEach, describe, expect, it, vi } from 'vitest'
import { sampleNow } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { UserMessage } from '../../types'
import MessageGroup from './MessageGroup.vue'

const message = (id: string, authorId = 'ivan'): UserMessage => ({
  type: 'user',
  id,
  authorId,
  sentAt: sampleNow,
  text: [{ text: `Сообщение ${id}` }],
})
const messages = [message('1'), message('2'), message('3')]

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(props: Record<string, unknown> = {}) {
  mounted = mountWithChatContext(MessageGroup, { messages, ...props })
  return mounted.container
}

describe('MessageGroup', () => {
  it('рисует по пузырю на каждое сообщение', () => {
    expect(mount().querySelectorAll('.chat-bubble')).toHaveLength(3)
  })

  it('соединяет углы внутри группы', () => {
    const [first, middle, last] = Array.from(mount().querySelectorAll('.chat-bubble'))
    const joined = (bubble?: Element) => [
      bubble?.classList.contains('chat-bubble--joined-before'),
      bubble?.classList.contains('chat-bubble--joined-after'),
    ]
    expect(joined(first)).toEqual([false, true])
    expect(joined(middle)).toEqual([true, true])
    expect(joined(last)).toEqual([true, false])
  })

  it('одно сообщение: углы не соединены', () => {
    const bubble = mount({ messages: [message('1')] }).querySelector('.chat-bubble')
    expect(bubble?.classList.contains('chat-bubble--joined-before')).toBe(false)
    expect(bubble?.classList.contains('chat-bubble--joined-after')).toBe(false)
  })

  it('передаёт направление пузырям', () => {
    expect(mount({ isOutgoing: true }).querySelectorAll('.chat-bubble--outgoing')).toHaveLength(3)
    mounted?.unmount()
    expect(mount().querySelectorAll('.chat-bubble--incoming')).toHaveLength(3)
  })

  describe('без автора', () => {
    it('не рисует ни аватар, ни имя', () => {
      const container = mount()
      expect(container.querySelector('.chat-message-group__avatar')).toBeNull()
      expect(container.querySelector('.chat-message-group__author')).toBeNull()
    })
  })

  describe('с автором', () => {
    it('рисует аватар и имя автора из справочника', () => {
      const container = mount({ showAuthor: true })
      expect(
        container.querySelector('.chat-message-group__avatar')?.getAttribute('aria-label'),
      ).toBe('Иван Петров')
      expect(container.querySelector('.chat-message-group__author')?.textContent.trim()).toBe(
        'Иван Петров',
      )
    })

    it('имя стоит только над первым пузырём', () => {
      const container = mount({ showAuthor: true })
      expect(container.querySelectorAll('.chat-message-group__author')).toHaveLength(1)
      const first = container.querySelector('.chat-bubble')
      expect(first?.querySelector('.chat-message-group__author')).not.toBeNull()
    })

    it('красит имя в цвет автора', () => {
      const name = mount({ showAuthor: true }).querySelector<HTMLElement>(
        '.chat-message-group__author',
      )
      expect(name?.style.color).toMatch(/^var\(--chat-avatar-color-[1-6]\)$/)
    })

    it('автора нет в справочнике: заглушка вместо имени', () => {
      const container = mount({ messages: [message('1', 'nobody')], showAuthor: true })
      expect(container.querySelector('.chat-message-group__author')?.textContent.trim()).toBe(
        'Неизвестный пользователь',
      )
    })

    it('нажатие на аватар сообщает об открытии автора', () => {
      const onOpenUser = vi.fn()
      const container = mount({ showAuthor: true, onOpenUser })
      container.querySelector<HTMLElement>('.chat-message-group__avatar')?.click()
      expect(onOpenUser).toHaveBeenCalledWith({ userId: 'ivan' })
    })

    it('нажатие на имя сообщает об открытии автора', () => {
      const onOpenUser = vi.fn()
      const container = mount({ showAuthor: true, onOpenUser })
      container.querySelector<HTMLElement>('.chat-message-group__author')?.click()
      expect(onOpenUser).toHaveBeenCalledWith({ userId: 'ivan' })
    })
  })

  it('нажатие на упоминание в тексте сообщает об открытии пользователя', () => {
    const onOpenUser = vi.fn()
    const container = mount({
      messages: [
        { ...message('1'), text: [{ text: '@Анна', format: ['mention'], userId: 'anna' }] },
      ],
      onOpenUser,
    })
    container.querySelector<HTMLElement>('.chat-text-mention')?.click()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'anna' })
  })

  it('нажатие на цитату в сообщении просит перейти к исходному', () => {
    const onGoToMessage = vi.fn()
    const container = mount({
      messages: [
        {
          ...message('1'),
          replyTo: { messageId: 'm0', excerpt: { authorId: 'anna', text: [{ text: 'Исходное' }] } },
        },
      ],
      onGoToMessage,
    })
    container.querySelector<HTMLElement>('.chat-reply-quote')?.click()
    expect(onGoToMessage).toHaveBeenCalledWith({ messageId: 'm0' })
  })

  it('сообщения заблокированного автора показывает заглушками', () => {
    const container = mount({
      messages: [message('1', 'blocked'), message('2', 'blocked')],
    })
    expect(container.querySelectorAll('.chat-hidden-stub')).toHaveLength(2)
    expect(container.querySelector('.chat-bubble')).toBeNull()
    expect(container.textContent).not.toContain('Сообщение 1')
  })

  it('нажатие на реакцию передаёт наружу установку реакции', () => {
    const onSetReaction = vi.fn()
    const container = mount({
      messages: [{ ...message('1'), reactions: [{ icon: { emoji: '👍' }, count: 1 }] }],
      onSetReaction,
    })
    container.querySelector<HTMLElement>('.chat-reaction-chip')?.click()
    expect(onSetReaction).toHaveBeenCalledWith({
      messageId: '1',
      icon: { emoji: '👍' },
      isSet: true,
    })
  })
})
