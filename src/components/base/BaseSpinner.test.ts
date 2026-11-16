import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import BaseSpinner from './BaseSpinner.vue'

function render(props: InstanceType<typeof BaseSpinner>['$props']) {
  const container = document.createElement('div')
  createApp({ render: () => h(BaseSpinner, props) }).mount(container)
  const spinner = container.querySelector('svg')
  if (!spinner) throw new Error('нет индикатора')
  return spinner
}

describe('BaseSpinner', () => {
  it('сообщает скринридерам о загрузке', () => {
    const spinner = render({})
    expect(spinner.getAttribute('role')).toBe('status')
    expect(spinner.getAttribute('aria-label')).toBe('Загрузка')
  })

  it('по умолчанию размер 24 пикселя', () => {
    expect(render({}).style.getPropertyValue('--chat-spinner-size')).toBe('24px')
  })

  it('задаёт размер через переменную', () => {
    expect(render({ size: 48 }).style.getPropertyValue('--chat-spinner-size')).toBe('48px')
  })
})
