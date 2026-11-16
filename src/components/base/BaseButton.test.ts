import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import BaseButton from './BaseButton.vue'

type Props = InstanceType<typeof BaseButton>['$props']

function render(props: Props, content = 'Кнопка', onClick?: () => void) {
  const container = document.createElement('div')
  createApp({ render: () => h(BaseButton, { ...props, onClick }, () => content) }).mount(container)
  const button = container.querySelector('button')
  if (!button) throw new Error('нет кнопки')
  return button
}

describe('BaseButton', () => {
  it('показывает переданное содержимое', () => {
    expect(render({}, 'Присоединиться').textContent).toBe('Присоединиться')
  })

  it('не отправляет форму по умолчанию', () => {
    expect(render({}).type).toBe('button')
  })

  it('по умолчанию обычный вариант', () => {
    expect(render({}).classList.contains('chat-button--secondary')).toBe(true)
  })

  it.each(['primary', 'secondary', 'danger'] as const)('применяет вариант %s', (variant) => {
    expect(render({ variant }).classList.contains(`chat-button--${variant}`)).toBe(true)
  })

  it('сообщает о нажатии', () => {
    const onClick = vi.fn()
    render({}, 'Кнопка', onClick).click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('в отключённом состоянии нажатия не проходят', () => {
    const onClick = vi.fn()
    const button = render({ isDisabled: true }, 'Кнопка', onClick)
    button.click()
    expect(button.disabled).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
  })
})
