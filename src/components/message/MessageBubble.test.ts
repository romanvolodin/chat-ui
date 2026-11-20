import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { UserMessage } from '../../types'
import MessageBubble from './MessageBubble.vue'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'ivan',
  sentAt: new Date('2026-11-17T12:00:00Z'),
  text: [{ text: 'Привет, ' }, { text: 'мир', format: ['bold'] }],
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
  mounted = mountWithChatContext(MessageBubble, { message, ...props }, slots)
  const bubble = mounted.container.querySelector<HTMLElement>('.chat-bubble')
  if (!bubble) throw new Error('Пузырь не нарисован')
  return bubble
}

describe('MessageBubble', () => {
  it('показывает текст сообщения с форматированием', () => {
    const bubble = mount()
    expect(bubble.querySelector('.chat-message-text')?.textContent).toContain('Привет, мир')
    expect(bubble.querySelector('strong')?.textContent).toBe('мир')
  })

  it('показывает время в конце текста', () => {
    const meta = mount().querySelector('.chat-message-text .chat-bubble__meta')
    expect(meta?.querySelector('time')?.textContent).toBe('15:00')
  })

  it('по умолчанию входящее', () => {
    const bubble = mount()
    expect(bubble.classList.contains('chat-bubble--incoming')).toBe(true)
    expect(bubble.classList.contains('chat-bubble--outgoing')).toBe(false)
  })

  it('исходящее показывает статус', () => {
    const bubble = mount({ isOutgoing: true, message: { ...message, status: 'read' } })
    expect(bubble.classList.contains('chat-bubble--outgoing')).toBe(true)
    expect(bubble.querySelector('.chat-message-status--read')).not.toBeNull()
  })

  it('передаёт в мету «изменено», булавку и просмотры', () => {
    const bubble = mount({
      message: { ...message, editedAt: message.sentAt, isPinned: true, viewCount: 1500 },
    })
    expect(bubble.textContent).toContain('изменено')
    expect(bubble.querySelector('.chat-message-meta__pin')).not.toBeNull()
    expect(bubble.querySelector('.chat-message-meta__views')?.textContent.trim()).toBe('1,5K')
  })

  describe('углы в группе', () => {
    it('одиночное сообщение: ни одной стороны не соединено', () => {
      const classes = mount().classList
      expect(classes.contains('chat-bubble--joined-before')).toBe(false)
      expect(classes.contains('chat-bubble--joined-after')).toBe(false)
    })

    it('первое в группе соединено только со следующим', () => {
      const classes = mount({ isLastInGroup: false }).classList
      expect(classes.contains('chat-bubble--joined-before')).toBe(false)
      expect(classes.contains('chat-bubble--joined-after')).toBe(true)
    })

    it('среднее соединено с обоими соседями', () => {
      const classes = mount({ isFirstInGroup: false, isLastInGroup: false }).classList
      expect(classes.contains('chat-bubble--joined-before')).toBe(true)
      expect(classes.contains('chat-bubble--joined-after')).toBe(true)
    })

    it('последнее соединено только с предыдущим', () => {
      const classes = mount({ isFirstInGroup: false }).classList
      expect(classes.contains('chat-bubble--joined-before')).toBe(true)
      expect(classes.contains('chat-bubble--joined-after')).toBe(false)
    })
  })

  it('без текста рисует одну мету', () => {
    const bubble = mount({ message: { ...message, text: undefined } })
    expect(bubble.querySelector('.chat-message-text')).toBeNull()
    expect(bubble.querySelector(':scope > .chat-bubble__meta')).not.toBeNull()
  })

  it('пустой список сегментов тоже считается отсутствием текста', () => {
    const bubble = mount({ message: { ...message, text: [] } })
    expect(bubble.querySelector('.chat-message-text')).toBeNull()
  })

  it('нажатие на упоминание сообщает об открытии пользователя', () => {
    const onOpenUser = vi.fn()
    const bubble = mount({
      message: { ...message, text: [{ text: '@Анна', format: ['mention'], userId: 'anna' }] },
      onOpenUser,
    })
    bubble.querySelector<HTMLElement>('.chat-text-mention')?.click()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'anna' })
  })

  describe('слот «header»', () => {
    it('показывается над текстом', () => {
      const bubble = mount({}, { header: () => h('span', { class: 'author' }, 'Иван') })
      const header = bubble.querySelector('.chat-bubble__header')
      expect(header?.textContent).toBe('Иван')
      expect(header?.nextElementSibling?.classList.contains('chat-message-text')).toBe(true)
    })

    it('без слота шапки нет', () => {
      expect(mount().querySelector('.chat-bubble__header')).toBeNull()
    })
  })
})
