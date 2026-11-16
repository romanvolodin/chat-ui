import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import BaseIconButton from './BaseIconButton.vue'
import { icons } from './icons'

type Props = InstanceType<typeof BaseIconButton>['$props']

function render(props: Props, onClick?: () => void) {
  const container = document.createElement('div')
  createApp({ render: () => h(BaseIconButton, { ...props, onClick }) }).mount(container)
  const button = container.querySelector('button')
  if (!button) throw new Error('нет кнопки')
  return button
}

describe('BaseIconButton', () => {
  it('задаёт подпись для скринридеров', () => {
    expect(render({ icon: 'search', label: 'Поиск' }).getAttribute('aria-label')).toBe('Поиск')
  })

  it('не отправляет форму по умолчанию', () => {
    expect(render({ icon: 'search', label: 'Поиск' }).type).toBe('button')
  })

  it('рисует выбранную иконку', () => {
    const button = render({ icon: 'menu', label: 'Меню' })
    expect(button.querySelectorAll('path')).toHaveLength(icons.menu.length)
  })

  it('по умолчанию размер 40, иконка 24', () => {
    const button = render({ icon: 'menu', label: 'Меню' })
    expect(button.style.getPropertyValue('--chat-icon-button-size')).toBe('40px')
    expect(button.querySelector('svg')?.style.getPropertyValue('--chat-icon-size')).toBe('24px')
  })

  it('масштабирует иконку вместе с кнопкой', () => {
    const button = render({ icon: 'menu', label: 'Меню', size: 60 })
    expect(button.style.getPropertyValue('--chat-icon-button-size')).toBe('60px')
    expect(button.querySelector('svg')?.style.getPropertyValue('--chat-icon-size')).toBe('36px')
  })

  it('сообщает о нажатии', () => {
    const onClick = vi.fn()
    render({ icon: 'menu', label: 'Меню' }, onClick).click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('в отключённом состоянии нажатия не проходят', () => {
    const onClick = vi.fn()
    const button = render({ icon: 'menu', label: 'Меню', isDisabled: true }, onClick)
    button.click()
    expect(button.disabled).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
  })
})
