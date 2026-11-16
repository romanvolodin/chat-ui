import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import BaseAvatar from './BaseAvatar.vue'

function render(props: InstanceType<typeof BaseAvatar>['$props']) {
  const container = document.createElement('div')
  createApp({ render: () => h(BaseAvatar, props) }).mount(container)
  return container
}

describe('BaseAvatar', () => {
  it('показывает картинку, если задан адрес', () => {
    const container = render({ name: 'Иван Петров', src: 'https://example.com/a.png' })
    const image = container.querySelector('img')
    expect(image?.getAttribute('src')).toBe('https://example.com/a.png')
    expect(image?.getAttribute('alt')).toBe('Иван Петров')
    expect(container.querySelector('.chat-avatar__initials')).toBeNull()
  })

  it('без адреса рисует инициалы', () => {
    const container = render({ name: 'Иван Петров' })
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.chat-avatar__initials')?.textContent).toBe('ИП')
  })

  it('выбирает цвет по имени так же, как chat-app', () => {
    const container = render({ name: 'Анна Иванова' })
    const initials = container.querySelector('.chat-avatar__initials')
    expect(initials?.classList.contains('chat-avatar__initials--color-6')).toBe(true)
  })

  it('по умолчанию без индикатора «в сети»', () => {
    expect(render({ name: 'Иван' }).querySelector('.chat-avatar__online')).toBeNull()
  })

  it('показывает индикатор «в сети»', () => {
    const container = render({ name: 'Иван', isOnline: true })
    expect(container.querySelector('.chat-avatar__online')).not.toBeNull()
  })

  it('задаёт размер через переменную', () => {
    const container = render({ name: 'Иван', size: 35 })
    const root = container.querySelector<HTMLElement>('.chat-avatar')
    expect(root?.style.getPropertyValue('--chat-avatar-size')).toBe('35px')
  })

  it('по умолчанию размер 50 пикселей', () => {
    const root = render({ name: 'Иван' }).querySelector<HTMLElement>('.chat-avatar')
    expect(root?.style.getPropertyValue('--chat-avatar-size')).toBe('50px')
  })
})
