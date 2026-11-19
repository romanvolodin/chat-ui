import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import SearchResultItem from './SearchResultItem.vue'

type Props = InstanceType<typeof SearchResultItem>['$props']

const containers: HTMLElement[] = []

afterEach(() => {
  containers.splice(0).forEach((container) => {
    container.remove()
  })
})

function render(props: Props) {
  const container = document.createElement('div')
  document.body.append(container)
  containers.push(container)
  createApp({ render: () => h(SearchResultItem, props) }).mount(container)
  const root = container.querySelector<HTMLElement>('.chat-search-result')
  if (!root) throw new Error('нет строки результата')
  return root
}

describe('SearchResultItem', () => {
  it('это кнопка, не отправляющая форму', () => {
    const root = render({ title: 'Иван' })
    expect(root.tagName).toBe('BUTTON')
    expect((root as HTMLButtonElement).type).toBe('button')
  })

  it('показывает название, подпись и время', () => {
    const root = render({ title: 'Иван', subtitle: 'Привет', time: '14:35' })
    expect(root.querySelector('.chat-search-result__title')?.textContent).toBe('Иван')
    expect(root.querySelector('.chat-search-result__subtitle')?.textContent).toBe('Привет')
    expect(root.querySelector('.chat-search-result__time')?.textContent).toBe('14:35')
  })

  it('без подписи и времени их не рисует', () => {
    const root = render({ title: 'Иван' })
    expect(root.querySelector('.chat-search-result__subtitle')).toBeNull()
    expect(root.querySelector('.chat-search-result__time')).toBeNull()
  })

  it('рисует аватар по названию', () => {
    expect(
      render({ title: 'Иван Петров' }).querySelector('.chat-avatar__initials')?.textContent,
    ).toBe('ИП')
  })

  it('показывает «в сети»', () => {
    expect(
      render({ title: 'Иван', isOnline: true }).querySelector('.chat-avatar__online'),
    ).not.toBeNull()
    expect(render({ title: 'Иван' }).querySelector('.chat-avatar__online')).toBeNull()
  })
})
