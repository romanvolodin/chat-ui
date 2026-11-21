import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, type App } from 'vue'
import type { FormattedText } from '../../types'
import type { ComposerMode } from './composerMode'
import MessageComposer from './MessageComposer.vue'

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
})

interface Props {
  draft?: FormattedText
  mode?: ComposerMode
}

function mount(initial: Props = {}, handlers: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const props = reactive<Props>({ ...initial })
  app = createApp({ render: () => h(MessageComposer, { ...props, ...handlers }) })
  app.mount(container)

  const field = () => {
    const element = container.querySelector('textarea')
    if (!element) throw new Error('Нет поля ввода')
    return element
  }
  const sendButton = () => {
    const element = container.querySelector<HTMLButtonElement>('.chat-composer__send')
    if (!element) throw new Error('Нет кнопки отправки')
    return element
  }
  const type = (value: string) => {
    field().value = value
    field().dispatchEvent(new Event('input'))
  }
  const pressEnter = () =>
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))

  return { container, props, field, sendButton, type, pressEnter }
}

const reply: ComposerMode = {
  kind: 'reply',
  messageId: 'm7',
  authorName: 'Иван Петров',
  text: 'Завтра сбор в 8:00',
}
const edit: ComposerMode = { kind: 'edit', messageId: 'm7', text: [{ text: 'Старый текст' }] }

describe('MessageComposer', () => {
  describe('кнопка отправки', () => {
    it('пока поле пустое, недоступна', () => {
      expect(mount().sendButton().disabled).toBe(true)
    })

    it('пока в поле одни пробелы, недоступна', async () => {
      const { sendButton, type } = mount()
      type('  \n ')
      await nextTick()
      expect(sendButton().disabled).toBe(true)
    })

    it('когда есть текст, доступна', async () => {
      const { sendButton, type } = mount()
      type('Привет')
      await nextTick()
      expect(sendButton().disabled).toBe(false)
    })
  })

  describe('черновик', () => {
    it('показывает черновик из данных', () => {
      expect(mount({ draft: [{ text: 'Недописанное' }] }).field().value).toBe('Недописанное')
    })

    it('сообщает об изменении текста сразу, без задержки', () => {
      const onChangeDraft = vi.fn()
      const { type } = mount({}, { onChangeDraft })
      type('При')
      type('Привет')
      expect(onChangeDraft).toHaveBeenNthCalledWith(1, { text: [{ text: 'При' }] })
      expect(onChangeDraft).toHaveBeenNthCalledWith(2, { text: [{ text: 'Привет' }] })
    })

    it('показывает черновик, который движок прислал позже', async () => {
      const { props, field } = mount()
      props.draft = [{ text: 'Подгрузили' }]
      await nextTick()
      expect(field().value).toBe('Подгрузили')
    })

    it('эхо собственной правки поле не меняет', async () => {
      const { props, field, type } = mount()
      type('Привет')
      await nextTick()
      props.draft = [{ text: 'Привет' }]
      await nextTick()
      expect(field().value).toBe('Привет')
    })
  })

  describe('отправка', () => {
    it('по нажатию кнопки отправляет текст без крайних пробелов', async () => {
      const onSendMessage = vi.fn()
      const { sendButton, type } = mount({}, { onSendMessage })
      type('  Привет, мир\n')
      await nextTick()
      sendButton().click()
      expect(onSendMessage).toHaveBeenCalledExactlyOnceWith({ text: [{ text: 'Привет, мир' }] })
    })

    it('по Enter отправляет так же', async () => {
      const onSendMessage = vi.fn()
      const { type, pressEnter } = mount({}, { onSendMessage })
      type('Привет')
      await nextTick()
      pressEnter()
      expect(onSendMessage).toHaveBeenCalledExactlyOnceWith({ text: [{ text: 'Привет' }] })
    })

    it('пустое сообщение не отправляет', () => {
      const onSendMessage = vi.fn()
      const { pressEnter } = mount({}, { onSendMessage })
      pressEnter()
      expect(onSendMessage).not.toHaveBeenCalled()
    })

    it('после отправки очищает поле и сообщает об очищенном черновике', async () => {
      const onChangeDraft = vi.fn()
      const { field, type, pressEnter } = mount({}, { onChangeDraft, onSendMessage: vi.fn() })
      type('Привет')
      await nextTick()
      pressEnter()
      await nextTick()
      expect(field().value).toBe('')
      expect(onChangeDraft).toHaveBeenLastCalledWith({ text: [] })
    })

    it('отправляет текст из черновика, который пришёл от движка', () => {
      const onSendMessage = vi.fn()
      const { sendButton } = mount({ draft: [{ text: 'Из черновика' }] }, { onSendMessage })
      sendButton().click()
      expect(onSendMessage).toHaveBeenCalledWith({ text: [{ text: 'Из черновика' }] })
    })
  })

  describe('ответ', () => {
    it('показывает плашку ответа', () => {
      const { container } = mount({ mode: reply })
      expect(container.querySelector('.chat-composer-reply__title')?.textContent).toBe(
        'Ответ Иван Петров',
      )
    })

    it('отправляет сообщение со ссылкой на исходное и завершает ответ', async () => {
      const onSendMessage = vi.fn()
      const onCancelMode = vi.fn()
      const { type, pressEnter } = mount({ mode: reply }, { onSendMessage, onCancelMode })
      type('Принято')
      await nextTick()
      pressEnter()
      expect(onSendMessage).toHaveBeenCalledExactlyOnceWith({
        text: [{ text: 'Принято' }],
        replyTo: { messageId: 'm7' },
      })
      expect(onCancelMode).toHaveBeenCalledOnce()
    })

    it('при ответе на выделенный фрагмент передаёт эти слова', async () => {
      const onSendMessage = vi.fn()
      const quote = [{ text: 'в 8:00' }]
      const { type, pressEnter } = mount({ mode: { ...reply, quote } }, { onSendMessage })
      type('Принято')
      await nextTick()
      pressEnter()
      expect(onSendMessage).toHaveBeenCalledWith({
        text: [{ text: 'Принято' }],
        replyTo: { messageId: 'm7', text: quote },
      })
    })

    it('крестик отменяет ответ', () => {
      const onCancelMode = vi.fn()
      const { container } = mount({ mode: reply }, { onCancelMode })
      container.querySelector<HTMLElement>('.chat-composer-reply button')?.click()
      expect(onCancelMode).toHaveBeenCalledOnce()
    })

    it('Esc отменяет ответ', () => {
      const onCancelMode = vi.fn()
      const { field } = mount({ mode: reply }, { onCancelMode })
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(onCancelMode).toHaveBeenCalledOnce()
    })

    it('Esc без ответа ничего не делает', () => {
      const onCancelMode = vi.fn()
      const { field } = mount({}, { onCancelMode })
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(onCancelMode).not.toHaveBeenCalled()
    })

    it('при начале ответа переводит фокус в поле', async () => {
      const { props, field } = mount()
      props.mode = reply
      await nextTick()
      await nextTick()
      expect(document.activeElement).toBe(field())
    })

    it('ответ не затирает черновик', async () => {
      const { props, field } = mount({ draft: [{ text: 'Недописанное' }] })
      props.mode = reply
      await nextTick()
      expect(field().value).toBe('Недописанное')
    })
  })

  describe('редактирование', () => {
    it('показывает в поле текст сообщения вместо черновика', () => {
      const { field } = mount({ draft: [{ text: 'Черновик' }], mode: edit })
      expect(field().value).toBe('Старый текст')
    })

    it('подставляет текст, когда редактирование началось уже после открытия', async () => {
      const { props, field } = mount({ draft: [{ text: 'Черновик' }] })
      props.mode = edit
      await nextTick()
      expect(field().value).toBe('Старый текст')
    })

    it('правки не попадают в черновик', async () => {
      const onChangeDraft = vi.fn()
      const { type } = mount({ mode: edit }, { onChangeDraft })
      type('Новый текст')
      await nextTick()
      expect(onChangeDraft).not.toHaveBeenCalled()
    })

    it('отправляет изменённый текст как редактирование и завершает его', async () => {
      const onEditMessage = vi.fn()
      const onSendMessage = vi.fn()
      const onCancelMode = vi.fn()
      const { type, pressEnter } = mount(
        { mode: edit },
        { onEditMessage, onSendMessage, onCancelMode },
      )
      type('  Новый текст ')
      await nextTick()
      pressEnter()
      expect(onEditMessage).toHaveBeenCalledExactlyOnceWith({
        messageId: 'm7',
        text: [{ text: 'Новый текст' }],
      })
      expect(onSendMessage).not.toHaveBeenCalled()
      expect(onCancelMode).toHaveBeenCalledOnce()
    })

    it('кнопка называется «Сохранить»', () => {
      expect(mount({ mode: edit }).sendButton().getAttribute('aria-label')).toBe('Сохранить')
    })

    it('после отмены редактирования возвращает черновик', async () => {
      const { props, field } = mount({ draft: [{ text: 'Черновик' }] })
      props.mode = edit
      await nextTick()
      props.mode = undefined
      await nextTick()
      expect(field().value).toBe('Черновик')
    })

    it('текст сообщения можно стереть и тогда отправить нельзя', async () => {
      const { sendButton, type } = mount({ mode: edit })
      type('')
      await nextTick()
      expect(sendButton().disabled).toBe(true)
    })
  })
})
