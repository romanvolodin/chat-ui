import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import BaseBadge from './BaseBadge.vue'

function render(props: InstanceType<typeof BaseBadge>['$props'], content: string) {
  const container = document.createElement('div')
  createApp({ render: () => h(BaseBadge, props, () => content) }).mount(container)
  return container.querySelector('.chat-badge')
}

describe('BaseBadge', () => {
  it('показывает переданное содержимое', () => {
    expect(render({}, '12')?.textContent).toBe('12')
  })

  it('по умолчанию без приглушённого вида', () => {
    expect(render({}, '1')?.classList.contains('chat-badge--muted')).toBe(false)
  })

  it('добавляет приглушённый вид', () => {
    expect(render({ isMuted: true }, '1')?.classList.contains('chat-badge--muted')).toBe(true)
  })
})
