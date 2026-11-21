import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import type { FormattedText } from '../../types'
import ComposerInput from './ComposerInput.vue'

let app: App | undefined
let scrollHeight = 40
let exposed: { focus: () => void } | undefined

beforeEach(() => {
  scrollHeight = 40
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => scrollHeight)
})

afterEach(() => {
  app?.unmount()
  app = undefined
  vi.restoreAllMocks()
})

function mount(initial: FormattedText = [], extra: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const state = reactive({ value: initial })
  app = createApp({
    render: () =>
      h(ComposerInput, {
        modelValue: state.value,
        'onUpdate:modelValue': (next: FormattedText) => {
          state.value = next
        },
        ref: (instance: unknown) => {
          exposed = instance as typeof exposed
        },
        ...extra,
      }),
  })
  app.mount(container)
  const field = container.querySelector('textarea')
  if (!field) throw new Error('Поле не нарисовано')
  const type = (value: string) => {
    field.value = value
    field.dispatchEvent(new Event('input'))
  }
  return { container, field, state, type }
}

function pressEnter(field: HTMLTextAreaElement, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, ...init })
  field.dispatchEvent(event)
  return event
}

describe('ComposerInput', () => {
  it('показывает текст из сегментов', () => {
    const { field } = mount([{ text: 'Привет, ' }, { text: 'мир', format: ['bold'] }])
    expect(field.value).toBe('Привет, мир')
  })

  it('по умолчанию подсказывает «Сообщение»', () => {
    expect(mount().field.placeholder).toBe('Сообщение')
  })

  it('принимает свою подсказку', () => {
    expect(mount([], { placeholder: 'Комментарий' }).field.placeholder).toBe('Комментарий')
  })

  it('ввод превращает в сегмент', () => {
    const { type, state } = mount()
    type('Привет\nмир')
    expect(state.value).toEqual([{ text: 'Привет\nмир' }])
  })

  it('очищенное поле даёт пустой список сегментов', () => {
    const { type, state } = mount([{ text: 'а' }])
    type('')
    expect(state.value).toEqual([])
  })

  it('обновляет поле, когда текст изменили снаружи', async () => {
    const { field, state } = mount([{ text: 'один' }])
    state.value = [{ text: 'два' }]
    await nextTick()
    expect(field.value).toBe('два')
  })

  describe('Enter', () => {
    it('отправляет и не добавляет перевод строки', () => {
      const onSubmit = vi.fn()
      const { field } = mount([{ text: 'а' }], { onSubmit })
      const event = pressEnter(field)
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(event.defaultPrevented).toBe(true)
    })

    it('с Shift ничего не отправляет и оставляет перевод строки', () => {
      const onSubmit = vi.fn()
      const { field } = mount([{ text: 'а' }], { onSubmit })
      const event = pressEnter(field, { shiftKey: true })
      expect(onSubmit).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
    })

    it('во время набора через IME ничего не отправляет', () => {
      const onSubmit = vi.fn()
      const { field } = mount([{ text: 'а' }], { onSubmit })
      pressEnter(field, { isComposing: true })
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('высота', () => {
    it('подстраивается под текст при открытии', () => {
      scrollHeight = 64
      expect(mount([{ text: 'много\nстрок' }]).field.style.height).toBe('64px')
    })

    it('растёт и уменьшается вместе с текстом', async () => {
      const { field, type } = mount()
      scrollHeight = 120
      type('а\nб\nв\nг')
      await nextTick()
      await nextTick()
      expect(field.style.height).toBe('120px')
      scrollHeight = 40
      type('а')
      await nextTick()
      await nextTick()
      expect(field.style.height).toBe('40px')
    })
  })

  it('передаёт фокус по запросу', () => {
    const { container } = mount()
    exposed?.focus()
    expect(document.activeElement).toBe(container.querySelector('textarea'))
  })
})
