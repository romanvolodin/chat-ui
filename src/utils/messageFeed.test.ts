import { describe, expect, it } from 'vitest'
import type { Message } from '../types'
import { buildFeed, type FeedItem } from './messageFeed'

const at = (iso: string) => new Date(iso)
const user = (id: string, authorId: string, iso = '2026-11-17T09:00:00Z'): Message => ({
  type: 'user',
  id,
  authorId,
  sentAt: at(iso),
})
const system = (id: string, iso = '2026-11-17T09:00:00Z'): Message => ({
  type: 'system',
  id,
  sentAt: at(iso),
  text: [{ text: 'Начало обсуждения' }],
})

const options = { currentUserId: 'me', timeZone: 'Europe/Moscow' }
const kinds = (feed: FeedItem[]) => feed.map((item) => item.kind)
const groupIds = (item: FeedItem | undefined) =>
  item?.kind === 'group' ? item.messages.map((message) => message.id) : []

describe('buildFeed', () => {
  it('для пустого списка даёт пустую ленту', () => {
    expect(buildFeed([], options)).toEqual([])
  })

  it('начинает ленту с заголовка дня', () => {
    const feed = buildFeed([user('1', 'ivan')], options)
    expect(kinds(feed)).toEqual(['date', 'group'])
  })

  it('собирает подряд идущие сообщения одного автора в одну группу', () => {
    const feed = buildFeed([user('1', 'ivan'), user('2', 'ivan'), user('3', 'ivan')], options)
    expect(kinds(feed)).toEqual(['date', 'group'])
    expect(groupIds(feed[1])).toEqual(['1', '2', '3'])
  })

  it('смена автора начинает новую группу', () => {
    const feed = buildFeed([user('1', 'ivan'), user('2', 'anna'), user('3', 'ivan')], options)
    expect(feed.slice(1).map(groupIds)).toEqual([['1'], ['2'], ['3']])
  })

  it('отмечает исходящие группы по текущему пользователю', () => {
    const feed = buildFeed([user('1', 'ivan'), user('2', 'me')], options)
    expect(feed.flatMap((item) => (item.kind === 'group' ? [item.isOutgoing] : []))).toEqual([
      false,
      true,
    ])
  })

  it('новый день начинает новую группу с тем же автором и добавляет заголовок', () => {
    const feed = buildFeed(
      [user('1', 'ivan', '2026-11-16T09:00:00Z'), user('2', 'ivan', '2026-11-17T09:00:00Z')],
      options,
    )
    expect(kinds(feed)).toEqual(['date', 'group', 'date', 'group'])
  })

  it('день считается в часовом поясе чата', () => {
    // обе отправлены 17 ноября по Москве, хотя по UTC даты разные
    const feed = buildFeed(
      [user('1', 'ivan', '2026-11-16T21:30:00Z'), user('2', 'ivan', '2026-11-17T09:00:00Z')],
      options,
    )
    expect(kinds(feed)).toEqual(['date', 'group'])
  })

  it('системное сообщение разрывает группу', () => {
    const feed = buildFeed([user('1', 'ivan'), system('s1'), user('2', 'ivan')], options)
    expect(kinds(feed)).toEqual(['date', 'group', 'system', 'group'])
  })

  describe('метка «Непрочитанные сообщения»', () => {
    it('встаёт перед первым непрочитанным и разрывает группу', () => {
      const messages = [user('1', 'ivan'), user('2', 'ivan'), user('3', 'ivan')]
      const feed = buildFeed(messages, { ...options, firstUnreadMessageId: '2' })
      expect(kinds(feed)).toEqual(['date', 'group', 'unread', 'group'])
      expect(feed.filter((item) => item.kind === 'group').map(groupIds)).toEqual([
        ['1'],
        ['2', '3'],
      ])
    })

    it('на границе дней идёт после заголовка дня', () => {
      const messages = [
        user('1', 'ivan', '2026-11-16T09:00:00Z'),
        user('2', 'ivan', '2026-11-17T09:00:00Z'),
      ]
      const feed = buildFeed(messages, { ...options, firstUnreadMessageId: '2' })
      expect(kinds(feed)).toEqual(['date', 'group', 'date', 'unread', 'group'])
    })

    it('если сообщения нет в списке, не появляется', () => {
      const feed = buildFeed([user('1', 'ivan')], { ...options, firstUnreadMessageId: 'nope' })
      expect(kinds(feed)).not.toContain('unread')
    })
  })

  it('ключи элементов уникальны и не зависят от порядка обхода', () => {
    const feed = buildFeed(
      [user('1', 'ivan'), system('s1'), user('2', 'anna', '2026-11-18T09:00:00Z')],
      { ...options, firstUnreadMessageId: '2' },
    )
    const keys = feed.map((item) => item.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('не меняет порядок сообщений', () => {
    const feed = buildFeed([user('b', 'ivan'), user('a', 'ivan')], options)
    expect(groupIds(feed[1])).toEqual(['b', 'a'])
  })
})
