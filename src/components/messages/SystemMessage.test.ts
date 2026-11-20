import { afterEach, describe, expect, it, vi } from 'vitest'
import { sampleNow } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { SystemMessage } from '../../types'
import SystemMessageView from './SystemMessage.vue'

const message: SystemMessage = {
  type: 'system',
  id: 's1',
  sentAt: sampleNow,
  text: [{ text: 'переименовал чат' }],
}

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(props: Record<string, unknown>) {
  mounted = mountWithChatContext(SystemMessageView, props)
  return mounted.container
}

describe('SystemMessage', () => {
  it('записывает id сообщения в атрибут', () => {
    const container = mount({ message })
    expect(container.querySelector('.chat-system-message')?.getAttribute('data-message-id')).toBe(
      's1',
    )
  })

  it('без автора показывает только текст', () => {
    const container = mount({ message: { ...message, text: [{ text: 'Начало обсуждения' }] } })
    expect(container.querySelector('.chat-system-message__author')).toBeNull()
    expect(container.querySelector('.chat-system-message')?.textContent.trim()).toBe(
      'Начало обсуждения',
    )
  })

  it('с автором ставит перед текстом его имя из справочника', () => {
    const container = mount({ message: { ...message, authorId: 'ivan' } })
    expect(container.querySelector('.chat-system-message__author')?.textContent.trim()).toBe(
      'Иван Петров',
    )
    expect(container.querySelector('.chat-message-text')?.textContent).toBe('переименовал чат')
  })

  it('автора нет в справочнике: заглушка вместо имени', () => {
    const container = mount({ message: { ...message, authorId: 'nobody' } })
    expect(container.querySelector('.chat-system-message__author')?.textContent.trim()).toBe(
      'Неизвестный пользователь',
    )
  })

  it('нажатие на имя сообщает об открытии пользователя', () => {
    const onOpenUser = vi.fn()
    const container = mount({ message: { ...message, authorId: 'ivan' }, onOpenUser })
    container.querySelector<HTMLElement>('.chat-system-message__author')?.click()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'ivan' })
  })

  it('нажатие на упоминание в тексте тоже сообщает об открытии пользователя', () => {
    const onOpenUser = vi.fn()
    const container = mount({
      message: {
        ...message,
        text: [{ text: 'добавил ' }, { text: 'Анну', format: ['mention'], userId: 'anna' }],
      },
      onOpenUser,
    })
    container.querySelector<HTMLElement>('.chat-text-mention')?.click()
    expect(onOpenUser).toHaveBeenCalledWith({ userId: 'anna' })
  })
})
