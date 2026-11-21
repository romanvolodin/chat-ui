import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import type { Reaction } from '../../types'
import ReactionChip from './ReactionChip.vue'

function mount(reaction: Reaction, extra: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  createApp({ render: () => h(ReactionChip, { reaction, ...extra }) }).mount(container)
  const chip = container.querySelector<HTMLElement>('.chat-reaction-chip')
  if (!chip) throw new Error('Реакция не нарисована')
  return chip
}

describe('ReactionChip', () => {
  it('показывает эмодзи и число', () => {
    const chip = mount({ icon: { emoji: '👍' }, count: 3 })
    expect(chip.querySelector('.chat-reaction-chip__emoji')?.textContent).toBe('👍')
    expect(chip.querySelector('.chat-reaction-chip__count')?.textContent).toBe('3')
  })

  it('картинку рисует вместо эмодзи', () => {
    const chip = mount({ icon: { imageUrl: 'https://example.com/r.png' }, count: 1 })
    expect(chip.querySelector('img')?.getAttribute('src')).toBe('https://example.com/r.png')
    expect(chip.querySelector('.chat-reaction-chip__emoji')).toBeNull()
  })

  it('большое число записывает компактно', () => {
    expect(
      mount({ icon: { emoji: '🔥' }, count: 1234 }).querySelector('.chat-reaction-chip__count')
        ?.textContent,
    ).toBe('1,2K')
  })

  it('свою реакцию выделяет и отмечает нажатой', () => {
    const chip = mount({ icon: { emoji: '👍' }, count: 3, isMine: true })
    expect(chip.classList.contains('chat-reaction-chip--mine')).toBe(true)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })

  it('чужую реакцию не выделяет', () => {
    const chip = mount({ icon: { emoji: '👍' }, count: 3 })
    expect(chip.classList.contains('chat-reaction-chip--mine')).toBe(false)
    expect(chip.getAttribute('aria-pressed')).toBe('false')
  })

  it('читается скринридером целиком, а не как отдельные значки', () => {
    expect(
      mount({ icon: { emoji: '👍' }, count: 3, isMine: true }).getAttribute('aria-label'),
    ).toBe('👍 3, ваша реакция')
    expect(mount({ icon: { emoji: '👍' }, count: 3 }).getAttribute('aria-label')).toBe('👍 3')
  })

  it('нажатие доходит до обработчика', () => {
    const onClick = vi.fn()
    mount({ icon: { emoji: '👍' }, count: 1 }, { onClick }).click()
    expect(onClick).toHaveBeenCalledOnce()
  })
})
