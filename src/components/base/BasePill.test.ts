import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import BasePill from './BasePill.vue'

describe('BasePill', () => {
  it('показывает содержимое слота', () => {
    const container = document.createElement('div')
    createApp({ render: () => h(BasePill, null, () => 'Вчера') }).mount(container)
    expect(container.querySelector('.chat-pill')?.textContent).toBe('Вчера')
  })
})
