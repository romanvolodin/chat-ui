import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import ScrollDownButton from './ScrollDownButton.vue'

function mount(props: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  createApp({ render: () => h(ScrollDownButton, props) }).mount(container)
  const button = container.querySelector('button')
  if (!button) throw new Error('Кнопка не нарисована')
  return button
}

describe('ScrollDownButton', () => {
  it('без непрочитанных подписана «Вниз» и без значка', () => {
    const button = mount()
    expect(button.getAttribute('aria-label')).toBe('Вниз')
    expect(button.querySelector('.chat-badge')).toBeNull()
  })

  it('нулевое число непрочитанных тоже без значка', () => {
    expect(mount({ unreadCount: 0 }).querySelector('.chat-badge')).toBeNull()
  })

  it('показывает число непрочитанных значком и в подписи', () => {
    const button = mount({ unreadCount: 7 })
    expect(button.querySelector('.chat-badge')?.textContent.trim()).toBe('7')
    expect(button.getAttribute('aria-label')).toBe('Вниз, непрочитанных: 7')
  })

  it('большое число записывает компактно', () => {
    expect(mount({ unreadCount: 1234 }).querySelector('.chat-badge')?.textContent.trim()).toBe(
      '1,2K',
    )
  })
})
