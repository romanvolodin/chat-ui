import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import DeleteMessagesDialog from './DeleteMessagesDialog.vue'

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ''
})

function mount(props: Record<string, unknown> = {}, handlers: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const state = reactive({ open: true })
  app = createApp({
    render: () =>
      h(DeleteMessagesDialog, {
        modelValue: state.open,
        'onUpdate:modelValue': (value: boolean) => {
          state.open = value
        },
        ...props,
        ...handlers,
      }),
  })
  app.mount(container)
  const button = (label: string) =>
    Array.from(container.querySelectorAll<HTMLElement>('.chat-button')).find(
      (item) => item.textContent.trim() === label,
    )
  return { container, state, button }
}

describe('DeleteMessagesDialog', () => {
  it('для одного сообщения спрашивает «Удалить сообщение?»', () => {
    expect(mount().container.querySelector('.chat-modal__title')?.textContent).toBe(
      'Удалить сообщение?',
    )
  })

  it.each([
    [2, 'Удалить 2 сообщения?'],
    [5, 'Удалить 5 сообщений?'],
    [21, 'Удалить 21 сообщение?'],
  ])('для %i сообщений: «%s»', (count, title) => {
    expect(mount({ count }).container.querySelector('.chat-modal__title')?.textContent).toBe(title)
  })

  it('без права удалять у всех выбора области нет, а подтверждение удаляет у себя', () => {
    const onConfirm = vi.fn()
    const { container, button } = mount({}, { onConfirm })
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()
    button('Удалить')?.click()
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith('self')
  })

  it('с правом удалять у всех по умолчанию выбрано «у себя»', () => {
    const onConfirm = vi.fn()
    const { container, button } = mount({ canDeleteForEveryone: true }, { onConfirm })
    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    expect(checkbox?.checked).toBe(false)
    button('Удалить')?.click()
    expect(onConfirm).toHaveBeenCalledWith('self')
  })

  it('с отмеченным «Удалить у всех» подтверждение удаляет у всех', async () => {
    const onConfirm = vi.fn()
    const { container, button } = mount({ canDeleteForEveryone: true }, { onConfirm })
    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    if (!checkbox) throw new Error('Нет флажка')
    checkbox.checked = true
    checkbox.dispatchEvent(new Event('change'))
    await nextTick()
    button('Удалить')?.click()
    expect(onConfirm).toHaveBeenCalledWith('everyone')
  })

  it('после подтверждения закрывается', async () => {
    const { button, state } = mount({}, { onConfirm: vi.fn() })
    button('Удалить')?.click()
    await nextTick()
    expect(state.open).toBe(false)
  })

  it('«Отмена» закрывает и ничего не удаляет', async () => {
    const onConfirm = vi.fn()
    const { button, state } = mount({}, { onConfirm })
    button('Отмена')?.click()
    await nextTick()
    expect(state.open).toBe(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('при повторном открытии выбор области сбрасывается на «у себя»', async () => {
    const { container, state } = mount({ canDeleteForEveryone: true })
    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    if (!checkbox) throw new Error('Нет флажка')
    checkbox.checked = true
    checkbox.dispatchEvent(new Event('change'))
    await nextTick()
    state.open = false
    await nextTick()
    state.open = true
    await nextTick()
    expect(container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false)
  })
})
