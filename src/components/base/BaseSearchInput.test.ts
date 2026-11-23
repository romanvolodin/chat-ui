import { describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import BaseSearchInput from './BaseSearchInput.vue'

let exposed: { focus: () => void } | undefined

interface Handlers {
  onUpdate?: (value: string) => void
  onSubmit?: () => void
}

function render(modelValue: string, { onUpdate, onSubmit }: Handlers = {}, placeholder?: string) {
  const container = document.createElement('div')
  createApp({
    render: () =>
      h(BaseSearchInput, {
        modelValue,
        placeholder,
        'onUpdate:modelValue': onUpdate,
        onSubmit,
        ref: (instance: unknown) => {
          exposed = instance as typeof exposed
        },
      }),
  }).mount(container)
  const field = container.querySelector<HTMLInputElement>('.chat-search-input__field')
  if (!field) throw new Error('нет поля ввода')
  return { container, field }
}

describe('BaseSearchInput', () => {
  it('показывает переданный текст', () => {
    expect(render('кино').field.value).toBe('кино')
  })

  it('по умолчанию подсказка «Поиск»', () => {
    const { field } = render('')
    expect(field.placeholder).toBe('Поиск')
    expect(field.getAttribute('aria-label')).toBe('Поиск')
  })

  it('принимает свою подсказку', () => {
    expect(render('', {}, 'Поиск по чатам').field.placeholder).toBe('Поиск по чатам')
  })

  it('сообщает о новом тексте при вводе', async () => {
    const onUpdate = vi.fn()
    const { field } = render('', { onUpdate })
    field.value = 'сцена'
    field.dispatchEvent(new Event('input'))
    await nextTick()
    expect(onUpdate).toHaveBeenCalledWith('сцена')
  })

  it('сообщает об Enter', () => {
    const onSubmit = vi.fn()
    const { field } = render('кино', { onSubmit })
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('не считает Enter при вводе через IME отправкой', () => {
    const onSubmit = vi.fn()
    const { field } = render('кино', { onSubmit })
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('прячет кнопку очистки при пустом тексте', () => {
    expect(render('').container.querySelector('button')).toBeNull()
  })

  it('очищает текст по кнопке', () => {
    const onUpdate = vi.fn()
    const { container } = render('кино', { onUpdate })
    container.querySelector('button')?.click()
    expect(onUpdate).toHaveBeenCalledWith('')
  })

  it('по запросу ставит курсор в поле', () => {
    const { container, field } = render('')
    document.body.append(container)
    exposed?.focus()
    expect(document.activeElement).toBe(field)
    container.remove()
  })
})
