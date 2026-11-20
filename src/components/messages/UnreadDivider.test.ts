import { describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import UnreadDivider from './UnreadDivider.vue'

describe('UnreadDivider', () => {
  it('подписывает границу непрочитанных сообщений', () => {
    const container = document.createElement('div')
    createApp(UnreadDivider).mount(container)
    const divider = container.querySelector('[role="separator"]')
    expect(divider?.textContent).toBe('Непрочитанные сообщения')
  })
})
