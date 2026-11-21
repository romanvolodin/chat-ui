import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import type { ComposerMode } from './composerMode'
import ComposerReplyPreview from './ComposerReplyPreview.vue'

function mount(mode: ComposerMode, extra: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  createApp({ render: () => h(ComposerReplyPreview, { mode, ...extra }) }).mount(container)
  return container
}

const reply: ComposerMode = {
  kind: 'reply',
  messageId: 'm1',
  authorName: 'Иван Петров',
  text: 'Завтра сбор в 8:00',
}
const edit: ComposerMode = {
  kind: 'edit',
  messageId: 'm1',
  text: [{ text: 'Завтра сбор ' }, { text: 'в 8:00', format: ['bold'] }],
}

describe('ComposerReplyPreview', () => {
  it('в режиме ответа называет автора и показывает цитату', () => {
    const container = mount(reply)
    expect(container.querySelector('.chat-composer-reply__title')?.textContent).toBe(
      'Ответ Иван Петров',
    )
    expect(container.querySelector('.chat-composer-reply__text')?.textContent).toBe(
      'Завтра сбор в 8:00',
    )
  })

  it('в режиме редактирования показывает текст сообщения без оформления', () => {
    const container = mount(edit)
    expect(container.querySelector('.chat-composer-reply__title')?.textContent).toBe(
      'Редактирование',
    )
    expect(container.querySelector('.chat-composer-reply__text')?.textContent).toBe(
      'Завтра сбор в 8:00',
    )
  })

  it('у кнопки отмены понятная подпись в каждом режиме', () => {
    expect(mount(reply).querySelector('button')?.getAttribute('aria-label')).toBe('Отменить ответ')
    expect(mount(edit).querySelector('button')?.getAttribute('aria-label')).toBe(
      'Отменить редактирование',
    )
  })

  it('нажатие на крестик сообщает об отмене', () => {
    const onCancel = vi.fn()
    mount(reply, { onCancel }).querySelector<HTMLElement>('button')?.click()
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
