import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { FormattedText } from '../../types'
import MessageText from './MessageText.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(text: FormattedText, handlers: Record<string, unknown> = {}) {
  mounted = mountWithChatContext(MessageText, { text, ...handlers })
  return mounted.container.querySelector<HTMLElement>('.chat-message-text')
}

describe('MessageText', () => {
  it('склеивает сегменты в исходный текст', () => {
    const root = mount([{ text: 'Привет, ' }, { text: 'мир', format: ['bold'] }, { text: '!' }])
    expect(root?.textContent).toBe('Привет, мир!')
  })

  it('сегмент без форматирования остаётся обычным текстом', () => {
    expect(mount([{ text: 'Просто текст' }])?.children).toHaveLength(0)
  })

  it.each([
    ['bold', 'strong'],
    ['italic', 'em'],
    ['underline', 'u'],
    ['strikethrough', 's'],
    ['code', 'code.chat-text-code'],
    ['quote', 'blockquote.chat-text-quote'],
  ] as const)('формат %s рисует «%s»', (format, selector) => {
    const root = mount([{ text: 'x', format: [format] }])
    expect(root?.querySelector(selector)?.textContent).toBe('x')
  })

  it('блок кода рисует pre и запоминает язык', () => {
    const root = mount([{ text: 'a { b: c }', format: ['codeBlock'], language: 'css' }])
    const block = root?.querySelector('pre.chat-text-code-block')
    expect(block?.getAttribute('data-language')).toBe('css')
    expect(block?.textContent).toBe('a { b: c }')
  })

  it('несколько видов форматирования вкладываются друг в друга', () => {
    const root = mount([{ text: 'x', format: ['italic', 'bold'] }])
    expect(root?.querySelector('strong > em')?.textContent).toBe('x')
  })

  it('порядок видов форматирования в данных ни на что не влияет', () => {
    const first = mount([{ text: 'x', format: ['bold', 'italic'] }])?.innerHTML
    mounted?.unmount()
    const second = mount([{ text: 'x', format: ['italic', 'bold'] }])?.innerHTML
    expect(first).toBe(second)
  })

  describe('ссылка', () => {
    it('ведёт по адресу сегмента и открывается в новой вкладке', () => {
      const root = mount([{ text: 'сайт', format: ['link'], url: 'https://example.com' }])
      const link = root?.querySelector('a')
      expect(link?.getAttribute('href')).toBe('https://example.com')
      expect(link?.getAttribute('target')).toBe('_blank')
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
    })

    it('без адреса ведёт по самому тексту', () => {
      const root = mount([{ text: 'example.com', format: ['link'] }])
      expect(root?.querySelector('a')?.getAttribute('href')).toBe('https://example.com')
    })

    it('небезопасный адрес показывает обычным текстом', () => {
      const root = mount([{ text: 'жми', format: ['link'], url: 'javascript:alert(1)' }])
      expect(root?.querySelector('a')).toBeNull()
      expect(root?.textContent).toBe('жми')
    })
  })

  describe('упоминание', () => {
    it('нажатие сообщает об открытии пользователя', () => {
      const onOpenUser = vi.fn()
      const root = mount([{ text: '@Иван', format: ['mention'], userId: 'ivan' }], { onOpenUser })
      root?.querySelector<HTMLElement>('.chat-text-mention')?.click()
      expect(onOpenUser).toHaveBeenCalledWith({ userId: 'ivan' })
    })

    it('без пользователя остаётся обычным текстом', () => {
      const root = mount([{ text: '@кто-то', format: ['mention'] }])
      expect(root?.querySelector('.chat-text-mention')).toBeNull()
      expect(root?.textContent).toBe('@кто-то')
    })
  })

  describe('спойлер', () => {
    it('скрыт, пока по нему не нажали', async () => {
      const root = mount([{ text: 'секрет', format: ['spoiler'] }])
      const spoiler = root?.querySelector<HTMLElement>('.chat-text-spoiler')
      expect(spoiler?.classList.contains('chat-text-spoiler--revealed')).toBe(false)
      expect(spoiler?.getAttribute('role')).toBe('button')
      spoiler?.click()
      await nextTick()
      expect(spoiler?.classList.contains('chat-text-spoiler--revealed')).toBe(true)
      expect(spoiler?.getAttribute('role')).toBeNull()
    })

    it('каждый спойлер раскрывается отдельно', async () => {
      const root = mount([
        { text: 'один', format: ['spoiler'] },
        { text: ' ' },
        { text: 'два', format: ['spoiler'] },
      ])
      const [first, second] = Array.from(
        root?.querySelectorAll<HTMLElement>('.chat-text-spoiler') ?? [],
      )
      first?.click()
      await nextTick()
      expect(first?.classList.contains('chat-text-spoiler--revealed')).toBe(true)
      expect(second?.classList.contains('chat-text-spoiler--revealed')).toBe(false)
    })
  })

  it('слот «trailing» встаёт после последнего сегмента', () => {
    mounted = mountWithChatContext(
      MessageText,
      { text: [{ text: 'Привет', format: ['bold'] }] },
      { trailing: () => h('span', { class: 'tail' }, '15:00') },
    )
    const root = mounted.container.querySelector('.chat-message-text')
    expect(root?.lastElementChild?.className).toBe('tail')
    expect(root?.textContent).toBe('Привет15:00')
  })
})
