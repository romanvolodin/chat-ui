import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import MessageHiddenStub from './MessageHiddenStub.vue'

describe('MessageHiddenStub', () => {
  it('показывает пометку «Сообщение скрыто» и сохраняет id сообщения', () => {
    const container = document.createElement('div')
    createApp({ render: () => h(MessageHiddenStub, { messageId: 'm7' }) }).mount(container)
    const stub = container.querySelector('.chat-hidden-stub')
    expect(stub?.textContent).toBe('Сообщение скрыто')
    expect(stub?.getAttribute('data-message-id')).toBe('m7')
  })
})
