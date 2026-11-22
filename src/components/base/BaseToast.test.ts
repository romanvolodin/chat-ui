import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import BaseToast from './BaseToast.vue'

describe('BaseToast', () => {
  it('показывает содержимое слота', () => {
    const container = document.createElement('div')
    createApp({ render: () => h(BaseToast, null, () => 'Ссылка скопирована') }).mount(container)
    expect(container.querySelector('.chat-toast')?.textContent).toBe('Ссылка скопирована')
  })
})
