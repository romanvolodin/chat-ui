import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { ReplyTo } from '../../types'
import MessageReplyQuote from './MessageReplyQuote.vue'

const replyTo: ReplyTo = {
  messageId: 'm5',
  excerpt: { authorId: 'ivan', text: [{ text: 'Завтра сбор в 8:00' }] },
}

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(reply: ReplyTo, handlers: Record<string, unknown> = {}) {
  mounted = mountWithChatContext(MessageReplyQuote, { replyTo: reply, ...handlers })
  return mounted.container
}

describe('MessageReplyQuote', () => {
  it('показывает автора и текст исходного сообщения', () => {
    const container = mount(replyTo)
    expect(container.querySelector('.chat-reply-quote__author')?.textContent).toBe('Иван Петров')
    expect(container.querySelector('.chat-reply-quote__text')?.textContent).toBe(
      'Завтра сбор в 8:00',
    )
  })

  it('для вложения без текста показывает его вид', () => {
    const container = mount({
      messageId: 'm5',
      excerpt: { authorId: 'ivan', contentKind: 'image' },
    })
    expect(container.querySelector('.chat-reply-quote__text')?.textContent).toBe('Фото')
  })

  it('форматирование в цитате сводится к простому тексту', () => {
    const container = mount({
      messageId: 'm5',
      excerpt: {
        authorId: 'ivan',
        text: [{ text: 'важно', format: ['bold'] }, { text: '\n  дальше' }],
      },
    })
    expect(container.querySelector('.chat-reply-quote__text')?.textContent).toBe('важно дальше')
  })

  it('автора нет в справочнике: заглушка вместо имени', () => {
    const container = mount({ ...replyTo, excerpt: { ...replyTo.excerpt, authorId: 'nobody' } })
    expect(container.querySelector('.chat-reply-quote__author')?.textContent).toBe(
      'Неизвестный пользователь',
    )
  })

  it('у системного сообщения имени автора нет', () => {
    const container = mount({
      messageId: 's1',
      excerpt: { isSystem: true, text: [{ text: 'Начало обсуждения' }] },
    })
    expect(container.querySelector('.chat-reply-quote__author')).toBeNull()
    expect(container.querySelector('.chat-reply-quote__text')?.textContent).toBe(
      'Начало обсуждения',
    )
  })

  it('красит цитату в цвет автора', () => {
    const quote = mount(replyTo).querySelector<HTMLElement>('.chat-reply-quote')
    expect(quote?.style.getPropertyValue('--chat-reply-quote-color')).toMatch(
      /^var\(--chat-avatar-color-[1-6]\)$/,
    )
  })

  it('нажатие просит перейти к исходному сообщению', () => {
    const onGoToMessage = vi.fn()
    mount(replyTo, { onGoToMessage }).querySelector<HTMLElement>('.chat-reply-quote')?.click()
    expect(onGoToMessage).toHaveBeenCalledExactlyOnceWith({ messageId: 'm5' })
  })
})
