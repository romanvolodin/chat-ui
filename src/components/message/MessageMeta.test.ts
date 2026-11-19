import { afterEach, describe, expect, it } from 'vitest'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import MessageMeta from './MessageMeta.vue'

// 12:00 UTC, в часовом поясе примеров (Москва) это 15:00
const sentAt = new Date('2026-11-17T12:00:00Z')

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(props: Record<string, unknown> = {}) {
  mounted = mountWithChatContext(MessageMeta, { sentAt, ...props })
  return mounted.container
}

describe('MessageMeta', () => {
  it('показывает время отправки в часовом поясе чата', () => {
    const time = mount().querySelector('time')
    expect(time?.textContent).toBe('15:00')
    expect(time?.getAttribute('datetime')).toBe('2026-11-17T12:00:00.000Z')
  })

  it('по умолчанию показывает только время', () => {
    const container = mount()
    expect(container.querySelector('.chat-message-status')).toBeNull()
    expect(container.querySelector('.chat-message-meta__views')).toBeNull()
    expect(container.querySelector('.chat-message-meta__pin')).toBeNull()
    expect(container.textContent).not.toContain('изменено')
  })

  it('показывает статус отправки', () => {
    expect(mount({ status: 'read' }).querySelector('.chat-message-status--read')).not.toBeNull()
  })

  it('показывает пометку «изменено» слева от времени', () => {
    const text = mount({ editedAt: sentAt }).textContent
    expect(text.indexOf('изменено')).toBeGreaterThanOrEqual(0)
    expect(text.indexOf('изменено')).toBeLessThan(text.indexOf('15:00'))
  })

  it('показывает булавку для закреплённого сообщения', () => {
    const pin = mount({ isPinned: true }).querySelector('.chat-message-meta__pin')
    expect(pin?.textContent.trim()).toBe('Закреплено')
  })

  it('показывает счётчик просмотров в компактной записи', () => {
    const views = mount({ viewCount: 1234 }).querySelector('.chat-message-meta__views')
    expect(views?.textContent.trim()).toBe('1,2K')
  })

  it('нулевой счётчик просмотров тоже показывается', () => {
    expect(mount({ viewCount: 0 }).querySelector('.chat-message-meta__views')).not.toBeNull()
  })

  it('порядок: просмотры, булавка, «изменено», время, статус', () => {
    const container = mount({ viewCount: 5, isPinned: true, editedAt: sentAt, status: 'sent' })
    const kindOf = (element: Element) => {
      if (element.classList.contains('chat-message-meta__views')) return 'views'
      if (element.classList.contains('chat-message-meta__pin')) return 'pin'
      if (element.classList.contains('chat-message-status')) return 'status'
      return element.tagName === 'TIME' ? 'time' : 'edited'
    }
    const children = Array.from(container.querySelector('.chat-message-meta')?.children ?? [])
    expect(children.map(kindOf)).toEqual(['views', 'pin', 'edited', 'time', 'status'])
  })
})
