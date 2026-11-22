import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import LinkDialog from './LinkDialog.vue'

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ''
})

function mount(url = 'https://example.com/chat/42') {
  const container = document.createElement('div')
  document.body.append(container)
  const state = reactive({ open: true })
  app = createApp({
    render: () =>
      h(LinkDialog, {
        url,
        modelValue: state.open,
        'onUpdate:modelValue': (value: boolean) => {
          state.open = value
        },
      }),
  })
  app.mount(container)
  return { container, state }
}

describe('LinkDialog', () => {
  it('показывает адрес в поле только для чтения', () => {
    const input = mount().container.querySelector<HTMLInputElement>('.chat-link-dialog__input')
    expect(input?.value).toBe('https://example.com/chat/42')
    expect(input?.readOnly).toBe(true)
  })

  it('объясняет, что копировать нужно вручную', () => {
    expect(mount().container.querySelector('.chat-link-dialog__text')?.textContent).toContain(
      'вручную',
    )
  })

  it('выделяет адрес целиком, чтобы осталось нажать «копировать»', async () => {
    const { container } = mount()
    await nextTick()
    await nextTick()
    const input = container.querySelector<HTMLInputElement>('.chat-link-dialog__input')
    expect(document.activeElement).toBe(input)
    expect(input?.selectionStart).toBe(0)
    expect(input?.selectionEnd).toBe('https://example.com/chat/42'.length)
  })

  it('«Закрыть» закрывает окно', async () => {
    const { container, state } = mount()
    container.querySelector<HTMLElement>('.chat-modal__footer .chat-button')?.click()
    await nextTick()
    expect(state.open).toBe(false)
  })
})
