import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import BaseModal from './BaseModal.vue'

const containers: HTMLElement[] = []

afterEach(() => {
  containers.splice(0).forEach((container) => {
    container.remove()
  })
})

function mount(isOpen = true, withFooter = true) {
  const open = ref(isOpen)
  const container = document.createElement('div')
  document.body.append(container)
  containers.push(container)
  createApp({
    render: () =>
      h(
        BaseModal,
        {
          modelValue: open.value,
          title: 'Удалить сообщение',
          'onUpdate:modelValue': (value: boolean) => {
            open.value = value
          },
        },
        {
          default: () => h('p', 'Это действие нельзя отменить'),
          ...(withFooter ? { footer: () => [h('button', 'Отмена'), h('button', 'Удалить')] } : {}),
        },
      ),
  }).mount(container)
  return { open, container }
}

const dialogOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.chat-modal__dialog')

describe('BaseModal', () => {
  it('не показывается, пока закрыт', () => {
    expect(mount(false).container.querySelector('.chat-modal')).toBeNull()
  })

  it('показывает заголовок, содержимое и подвал', () => {
    const { container } = mount()
    expect(container.querySelector('.chat-modal__title')?.textContent).toBe('Удалить сообщение')
    expect(container.querySelector('.chat-modal__body')?.textContent).toBe(
      'Это действие нельзя отменить',
    )
    expect(container.querySelectorAll('.chat-modal__footer button')).toHaveLength(2)
  })

  it('без подвала не рисует его', () => {
    expect(mount(true, false).container.querySelector('.chat-modal__footer')).toBeNull()
  })

  it('помечает окно как модальное диалоговое с подписью из заголовка', () => {
    const { container } = mount()
    const dialog = dialogOf(container)
    const title = container.querySelector('.chat-modal__title')
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(title?.id).toBeTruthy()
    expect(dialog?.getAttribute('aria-labelledby')).toBe(title?.id)
  })

  it('закрывается по Escape', async () => {
    const { open, container } = mount()
    dialogOf(container)?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('закрывается по нажатию на затемнение', async () => {
    const { open, container } = mount()
    container.querySelector('.chat-modal')?.dispatchEvent(new Event('pointerdown'))
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('не закрывается по нажатию внутри окна', async () => {
    const { open, container } = mount()
    dialogOf(container)?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(open.value).toBe(true)
  })

  it('закрывается кнопкой в шапке', async () => {
    const { open, container } = mount()
    container.querySelector<HTMLButtonElement>('.chat-modal__header button')?.click()
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('переводит фокус в окно при открытии', async () => {
    const { container } = mount()
    await nextTick()
    expect(document.activeElement).toBe(dialogOf(container))
  })

  it('держит фокус внутри окна при Tab с последнего элемента', async () => {
    const { container } = mount()
    await nextTick()
    const buttons = container.querySelectorAll<HTMLButtonElement>('button')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    last?.focus()
    last?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(first)
  })

  it('держит фокус внутри окна при Shift+Tab с первого элемента', async () => {
    const { container } = mount()
    await nextTick()
    const buttons = container.querySelectorAll<HTMLButtonElement>('button')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    first?.focus()
    first?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    )
    expect(document.activeElement).toBe(last)
  })

  it('возвращает фокус туда, откуда окно открыли', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const { open } = mount(false)
    open.value = true
    await nextTick()
    await nextTick()
    expect(document.activeElement).not.toBe(trigger)
    open.value = false
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })
})
