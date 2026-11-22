import { describe, expect, it } from 'vitest'
import type { UserMessage } from '../types'
import { messageMenuItems } from './messageMenu'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'ivan',
  sentAt: new Date('2026-11-17T12:00:00Z'),
  text: [{ text: 'Привет' }],
}
const options = { isOutgoing: false, canWrite: true, hasSelection: false }
const ids = (items: { id: string }[]) => items.map((item) => item.id)
const itemsFor = (extra: Partial<UserMessage> = {}, override: Partial<typeof options> = {}) =>
  messageMenuItems({ ...message, ...extra }, { ...options, ...override })

describe('messageMenuItems', () => {
  it('у чужого сообщения: ответить, закрепить, ссылка, удалить', () => {
    expect(ids(itemsFor())).toEqual(['reply', 'pin', 'getLink', 'delete'])
  })

  it('у своего сообщения с текстом добавляется «Изменить» после «Ответить»', () => {
    expect(ids(itemsFor({}, { isOutgoing: true }))).toEqual([
      'reply',
      'edit',
      'pin',
      'getLink',
      'delete',
    ])
  })

  it('чужое сообщение изменить нельзя', () => {
    expect(ids(itemsFor())).not.toContain('edit')
  })

  it('своё сообщение без текста изменить нельзя', () => {
    expect(ids(itemsFor({ text: undefined }, { isOutgoing: true }))).not.toContain('edit')
    expect(ids(itemsFor({ text: [] }, { isOutgoing: true }))).not.toContain('edit')
  })

  it.each(['sending', 'error'] as const)(
    'своё сообщение в статусе «%s» изменить нельзя',
    (status) => {
      expect(ids(itemsFor({ status }, { isOutgoing: true }))).not.toContain('edit')
    },
  )

  it.each(['sent', 'read'] as const)('своё сообщение в статусе «%s» изменить можно', (status) => {
    expect(ids(itemsFor({ status }, { isOutgoing: true }))).toContain('edit')
  })

  it('если в чат писать нельзя, нет ни «Ответить», ни «Изменить»', () => {
    expect(ids(itemsFor({}, { isOutgoing: true, canWrite: false }))).toEqual([
      'pin',
      'getLink',
      'delete',
    ])
  })

  it('у закреплённого сообщения вместо «Закрепить» стоит «Открепить»', () => {
    const items = itemsFor({ isPinned: true })
    expect(ids(items)).toContain('unpin')
    expect(ids(items)).not.toContain('pin')
  })

  it('при выделенных словах «Ответить» предлагает ответить на выделенное', () => {
    const reply = itemsFor({}, { hasSelection: true }).find((item) => item.id === 'reply')
    expect(reply?.label).toBe('Ответить на выделенное')
  })

  it('без выделения «Ответить» называется просто «Ответить»', () => {
    expect(itemsFor().find((item) => item.id === 'reply')?.label).toBe('Ответить')
  })

  it('«Удалить» помечено как опасное и стоит последним', () => {
    const items = itemsFor()
    expect(items.at(-1)).toMatchObject({ id: 'delete', isDanger: true })
  })
})
