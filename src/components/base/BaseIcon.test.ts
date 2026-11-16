import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import BaseIcon from './BaseIcon.vue'
import { icons } from './icons'

function render(props: InstanceType<typeof BaseIcon>['$props']) {
  const container = document.createElement('div')
  createApp({ render: () => h(BaseIcon, props) }).mount(container)
  return container.querySelector('svg')
}

describe('BaseIcon', () => {
  it('рисует все контуры иконки', () => {
    const svg = render({ name: 'menu' })
    expect(svg?.querySelectorAll('path')).toHaveLength(icons.menu.length)
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe(icons.menu[0])
  })

  it('прячет иконку от скринридеров', () => {
    expect(render({ name: 'check' })?.getAttribute('aria-hidden')).toBe('true')
  })

  it('по умолчанию размер 24 пикселя', () => {
    expect(render({ name: 'check' })?.style.getPropertyValue('--chat-icon-size')).toBe('24px')
  })

  it('задаёт размер через переменную', () => {
    expect(render({ name: 'check', size: 16 })?.style.getPropertyValue('--chat-icon-size')).toBe(
      '16px',
    )
  })
})

describe('icons', () => {
  it('у каждой иконки есть хотя бы один контур', () => {
    for (const [name, paths] of Object.entries(icons)) {
      expect(paths.length, name).toBeGreaterThan(0)
    }
  })

  it('имена записаны строчными буквами через дефис', () => {
    for (const name of Object.keys(icons)) {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/)
    }
  })

  it('контуры начинаются с команды перемещения и содержат только допустимые символы', () => {
    for (const [name, paths] of Object.entries(icons)) {
      for (const path of paths) {
        expect(path, name).toMatch(/^[Mm][MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/)
      }
    }
  })
})
