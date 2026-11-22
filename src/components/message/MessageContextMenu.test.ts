import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import { sampleNow } from '../../docs/sampleData'
import type { UserMessage } from '../../types'
import MessageContextMenu from './MessageContextMenu.vue'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'me',
  sentAt: sampleNow,
  text: [{ text: 'Привет' }],
}

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ''
})

function mount(props: Record<string, unknown> = {}, handlers: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const state = reactive({ open: true, ...props })
  app = createApp({
    render: () =>
      h(MessageContextMenu, {
        message,
        anchor: { x: 10, y: 10 },
        modelValue: state.open,
        'onUpdate:modelValue': (value: boolean) => {
          state.open = value
        },
        ...props,
        ...handlers,
      }),
  })
  app.mount(container)
  return { container, state }
}

const labels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.chat-menu__item'), (item) => item.textContent.trim())

describe('MessageContextMenu', () => {
  it('показывает пункты, подходящие сообщению', async () => {
    const { container } = mount({ isOutgoing: true })
    await nextTick()
    expect(labels(container)).toEqual([
      'Ответить',
      'Изменить',
      'Закрепить',
      'Получить ссылку',
      'Удалить',
    ])
  })

  it('у чужого сообщения «Изменить» нет', async () => {
    const { container } = mount()
    await nextTick()
    expect(labels(container)).not.toContain('Изменить')
  })

  it('если в чат писать нельзя, ответа и изменения нет', async () => {
    const { container } = mount({ isOutgoing: true, canWrite: false })
    await nextTick()
    expect(labels(container)).toEqual(['Закрепить', 'Получить ссылку', 'Удалить'])
  })

  it('у закреплённого сообщения предлагает открепить', async () => {
    const { container } = mount({ message: { ...message, isPinned: true } })
    await nextTick()
    expect(labels(container)).toContain('Открепить')
  })

  it('при выделенных словах предлагает ответить на выделенное', async () => {
    const { container } = mount({ hasSelection: true })
    await nextTick()
    expect(labels(container)[0]).toBe('Ответить на выделенное')
  })

  it.each([
    ['Ответить', 'reply'],
    ['Изменить', 'edit'],
    ['Закрепить', 'pin'],
    ['Получить ссылку', 'getLink'],
    ['Удалить', 'delete'],
  ])('пункт «%s» сообщает о действии «%s»', async (label, action) => {
    const onAction = vi.fn()
    const { container } = mount({ isOutgoing: true }, { onAction })
    await nextTick()
    const item = Array.from(container.querySelectorAll<HTMLElement>('.chat-menu__item')).find(
      (candidate) => candidate.textContent.trim() === label,
    )
    item?.click()
    expect(onAction).toHaveBeenCalledExactlyOnceWith(action)
  })

  it('после выбора закрывается', async () => {
    const { container, state } = mount()
    await nextTick()
    container.querySelector<HTMLElement>('.chat-menu__item')?.click()
    await nextTick()
    expect(state.open).toBe(false)
  })

  it('без сообщения пунктов нет', async () => {
    const { container } = mount({ message: undefined })
    await nextTick()
    expect(container.querySelectorAll('.chat-menu__item')).toHaveLength(0)
  })
})
