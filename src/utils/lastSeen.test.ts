import { describe, expect, it } from 'vitest'
import { formatLastSeen } from './dateTime'

const now = new Date('2026-11-17T12:00:00Z')
const zone = 'Europe/Moscow'
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000)

describe('formatLastSeen', () => {
  it('меньше минуты назад: «только что»', () => {
    expect(formatLastSeen(minutesAgo(0), now, zone)).toBe('только что')
  })

  it('время из будущего тоже «только что»: часы устройств расходятся', () => {
    expect(formatLastSeen(minutesAgo(-5), now, zone)).toBe('только что')
  })

  it.each([
    [1, '1 минуту назад'],
    [3, '3 минуты назад'],
    [25, '25 минут назад'],
    [59, '59 минут назад'],
  ])('%i мин назад: «%s»', (minutes, expected) => {
    expect(formatLastSeen(minutesAgo(minutes), now, zone)).toBe(expected)
  })

  it('больше часа назад, но сегодня: «сегодня в 13:30»', () => {
    expect(formatLastSeen(minutesAgo(90), now, zone)).toBe('сегодня в 13:30')
  })

  it('день считается в часовом поясе чата, а не по UTC', () => {
    // 00:30 по Москве, хотя по UTC ещё 16 ноября
    expect(formatLastSeen(new Date('2026-11-16T21:30:00Z'), now, zone)).toBe('сегодня в 00:30')
  })

  it('вчера: «вчера в 12:00»', () => {
    expect(formatLastSeen(new Date('2026-11-16T09:00:00Z'), now, zone)).toBe('вчера в 12:00')
  })

  it('раньше: день, месяц и время', () => {
    expect(formatLastSeen(new Date('2026-11-12T11:35:00Z'), now, zone)).toBe('12 ноя в 14:35')
  })

  it('в прошлом году: с годом и без времени', () => {
    expect(formatLastSeen(new Date('2025-03-05T10:00:00Z'), now, zone)).toBe('5 мар 2025')
  })
})
