import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { provideChatContext } from '../../composables/chatContext'
import { sampleNow, sampleTimeZone, sampleUsers } from '../../docs/sampleData'
import type { Chat } from '../../types'
import ChatListItem from './ChatListItem.vue'

const baseChat: Chat = { id: 'c1', type: 'group', title: 'Съёмочная группа' }
const sentAt = new Date(sampleNow.getTime() - 25 * 60_000)

function render(chat: Partial<Chat> = {}, isSelected = false) {
  const container = document.createElement('div')
  createApp({
    setup() {
      provideChatContext({
        currentUserId: 'me',
        users: sampleUsers,
        chats: [],
        settings: { now: sampleNow, timeZone: sampleTimeZone },
      })
      return () => h(ChatListItem, { chat: { ...baseChat, ...chat }, isSelected })
    },
  }).mount(container)
  const root = container.querySelector<HTMLElement>('.chat-list-item')
  if (!root) throw new Error('нет строки списка')
  const text = (selector: string) => root.querySelector(selector)?.textContent
  return { root, text }
}

describe('ChatListItem', () => {
  it('это кнопка, не отправляющая форму', () => {
    expect(render().root.tagName).toBe('BUTTON')
    expect((render().root as HTMLButtonElement).type).toBe('button')
  })

  it('показывает название', () => {
    expect(render().text('.chat-list-item__title')).toBe('Съёмочная группа')
  })

  it('без последнего сообщения не показывает время и текст', () => {
    const { text } = render()
    expect(text('.chat-list-item__time')).toBeUndefined()
    expect(text('.chat-list-item__excerpt')).toBe('')
  })

  it('показывает время последнего сообщения', () => {
    const { text } = render({
      lastMessage: { excerpt: { authorId: 'anna', text: [{ text: 'Привет' }] }, sentAt },
    })
    expect(text('.chat-list-item__time')).toBe('14:35')
  })

  it('в группе подписывает текст именем автора', () => {
    const { text } = render({
      lastMessage: { excerpt: { authorId: 'anna', text: [{ text: 'Привет' }] }, sentAt },
    })
    expect(text('.chat-list-item__excerpt')).toBe('Анна Смирнова: Привет')
  })

  it('свои сообщения подписывает «Вы:»', () => {
    const { text } = render({
      lastMessage: { excerpt: { authorId: 'me', text: [{ text: 'Готово' }] }, sentAt },
    })
    expect(text('.chat-list-item__excerpt')).toBe('Вы: Готово')
  })

  it('к вложению без текста пишет подпись по типу', () => {
    const { text } = render({
      lastMessage: { excerpt: { authorId: 'anna', contentKind: 'image' }, sentAt },
    })
    expect(text('.chat-list-item__excerpt')).toBe('Анна Смирнова: Фото')
  })

  it('показывает статус исходящего сообщения', () => {
    const { root } = render({
      lastMessage: { excerpt: { authorId: 'me', text: [{ text: 'Ок' }] }, sentAt, status: 'read' },
    })
    expect(root.querySelector('.chat-message-status')?.getAttribute('aria-label')).toBe('Прочитано')
  })

  it('у входящего сообщения статуса нет', () => {
    const { root } = render({
      lastMessage: { excerpt: { authorId: 'anna', text: [{ text: 'Ок' }] }, sentAt },
    })
    expect(root.querySelector('.chat-message-status')).toBeNull()
  })

  it('показывает счётчик непрочитанных', () => {
    const { root } = render({ unreadCount: 12 })
    const badge = root.querySelector('.chat-badge')
    expect(badge?.textContent).toBe('12')
    expect(badge?.classList.contains('chat-badge--muted')).toBe(false)
  })

  it('у чата без звука счётчик приглушённый', () => {
    const { root } = render({ unreadCount: 3, isMuted: true })
    expect(root.querySelector('.chat-badge')?.classList.contains('chat-badge--muted')).toBe(true)
  })

  it('не показывает счётчик, если непрочитанных нет', () => {
    expect(render({ unreadCount: 0 }).root.querySelector('.chat-badge')).toBeNull()
  })

  it('показывает значок «@» для непрочитанных упоминаний', () => {
    const { root } = render({ unreadMentionCount: 2, unreadCount: 5 })
    const badges = [...root.querySelectorAll('.chat-badge')].map((badge) => badge.textContent)
    expect(badges).toEqual(['@', '5'])
  })

  it('показывает булавку закреплённому чату без счётчиков', () => {
    expect(render({ isPinned: true }).root.querySelectorAll('svg')).toHaveLength(1)
    expect(render().root.querySelectorAll('svg')).toHaveLength(0)
  })

  it('вместо булавки показывает счётчик или упоминание', () => {
    expect(render({ isPinned: true, unreadCount: 4 }).root.querySelectorAll('svg')).toHaveLength(0)
    expect(
      render({ isPinned: true, unreadMentionCount: 1 }).root.querySelectorAll('svg'),
    ).toHaveLength(0)
  })

  it('показывает колокольчик для чата без звука', () => {
    expect(
      render({ isMuted: true }).root.querySelector('.chat-list-item__title + svg'),
    ).not.toBeNull()
    expect(render().root.querySelector('.chat-list-item__title + svg')).toBeNull()
  })

  it('показывает «в сети» у собеседника из справочника', () => {
    expect(
      render({ type: 'private', peerId: 'ivan' }).root.querySelector('.chat-avatar__online'),
    ).not.toBeNull()
    expect(
      render({ type: 'private', peerId: 'anna' }).root.querySelector('.chat-avatar__online'),
    ).toBeNull()
  })

  it('отмечает выбранный чат', () => {
    const selected = render({}, true).root
    expect(selected.classList.contains('chat-list-item--selected')).toBe(true)
    expect(selected.getAttribute('aria-current')).toBe('true')
    const regular = render().root
    expect(regular.classList.contains('chat-list-item--selected')).toBe(false)
    expect(regular.hasAttribute('aria-current')).toBe(false)
  })
})
