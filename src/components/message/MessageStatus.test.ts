import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import type { MessageStatus as Status } from '../../types'
import { icons } from '../base/icons'
import MessageStatus from './MessageStatus.vue'

function render(status: Status, size?: number) {
  const container = document.createElement('div')
  createApp({ render: () => h(MessageStatus, { status, size }) }).mount(container)
  const element = container.querySelector<HTMLElement>('.chat-message-status')
  if (!element) throw new Error('нет значка статуса')
  return element
}

describe('MessageStatus', () => {
  it.each([
    ['sending', 'Отправляется', 'clock'],
    ['sent', 'Отправлено', 'check'],
    ['read', 'Прочитано', 'check-double'],
    ['error', 'Ошибка отправки', 'alert-circle'],
  ] as const)('статус %s: подпись «%s» и иконка %s', (status, label, icon) => {
    const element = render(status)
    expect(element.getAttribute('role')).toBe('img')
    expect(element.getAttribute('aria-label')).toBe(label)
    expect(element.querySelectorAll('path')).toHaveLength(icons[icon].length)
    expect(element.querySelector('path')?.getAttribute('d')).toBe(icons[icon][0])
  })

  it('по умолчанию размер 16', () => {
    expect(render('sent').querySelector('svg')?.style.getPropertyValue('--chat-icon-size')).toBe(
      '16px',
    )
  })

  it('принимает размер', () => {
    expect(
      render('sent', 20).querySelector('svg')?.style.getPropertyValue('--chat-icon-size'),
    ).toBe('20px')
  })

  it('отмечает ошибку отдельным классом', () => {
    expect(render('error').classList.contains('chat-message-status--error')).toBe(true)
    expect(render('read').classList.contains('chat-message-status--error')).toBe(false)
  })
})
