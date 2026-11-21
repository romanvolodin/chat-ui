import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import type { Reaction } from '../../types'
import MessageReactions from './MessageReactions.vue'

const reactions: Reaction[] = [
  { icon: { emoji: '👍' }, count: 3, isMine: true },
  { icon: { emoji: '🔥' }, count: 1 },
  { icon: { imageUrl: 'https://example.com/r.png' }, count: 2 },
]

function mount(props: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  createApp({
    render: () => h(MessageReactions, { messageId: 'm1', reactions, ...props }),
  }).mount(container)
  return container
}

describe('MessageReactions', () => {
  it('рисует по значку на каждую реакцию', () => {
    expect(mount().querySelectorAll('.chat-reaction-chip')).toHaveLength(3)
  })

  it('без реакций ничего не рисует', () => {
    expect(mount({ reactions: [] }).querySelector('.chat-message-reactions')).toBeNull()
  })

  it('у исходящего сообщения прижимается вправо', () => {
    expect(
      mount({ isOutgoing: true })
        .querySelector('.chat-message-reactions')
        ?.classList.contains('chat-message-reactions--outgoing'),
    ).toBe(true)
  })

  it('нажатие на чужую реакцию ставит её', () => {
    const onSetReaction = vi.fn()
    const chips = mount({ onSetReaction }).querySelectorAll<HTMLElement>('.chat-reaction-chip')
    chips[1]?.click()
    expect(onSetReaction).toHaveBeenCalledExactlyOnceWith({
      messageId: 'm1',
      icon: { emoji: '🔥' },
      isSet: true,
    })
  })

  it('нажатие на свою реакцию снимает её', () => {
    const onSetReaction = vi.fn()
    const chips = mount({ onSetReaction }).querySelectorAll<HTMLElement>('.chat-reaction-chip')
    chips[0]?.click()
    expect(onSetReaction).toHaveBeenCalledExactlyOnceWith({
      messageId: 'm1',
      icon: { emoji: '👍' },
      isSet: false,
    })
  })

  it('реакцию-картинку передаёт как есть', () => {
    const onSetReaction = vi.fn()
    mount({ onSetReaction }).querySelectorAll<HTMLElement>('.chat-reaction-chip')[2]?.click()
    expect(onSetReaction).toHaveBeenCalledWith({
      messageId: 'm1',
      icon: { imageUrl: 'https://example.com/r.png' },
      isSet: true,
    })
  })

  it('само число не меняет: его присылает движок', () => {
    const container = mount({ onSetReaction: vi.fn() })
    container.querySelectorAll<HTMLElement>('.chat-reaction-chip')[1]?.click()
    expect(container.querySelectorAll('.chat-reaction-chip__count')[1]?.textContent).toBe('1')
  })
})
