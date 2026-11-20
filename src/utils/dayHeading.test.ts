import { describe, expect, it } from 'vitest'
import { formatDayHeading, getDayKey } from './dateTime'

const now = new Date('2026-11-17T12:00:00Z')
const zone = 'Europe/Moscow'

describe('getDayKey', () => {
  it('даёт день в часовом поясе чата, а не по UTC', () => {
    // 00:30 по Москве, по UTC ещё 16 ноября
    expect(getDayKey(new Date('2026-11-16T21:30:00Z'), zone)).toBe('2026-11-17')
    expect(getDayKey(new Date('2026-11-16T21:30:00Z'), 'UTC')).toBe('2026-11-16')
  })

  it('дополняет месяц и день нулями', () => {
    expect(getDayKey(new Date('2026-03-05T10:00:00Z'), zone)).toBe('2026-03-05')
  })
})

describe('formatDayHeading', () => {
  it.each([
    ['2026-11-17T08:00:00Z', 'Сегодня'],
    ['2026-11-16T08:00:00Z', 'Вчера'],
    ['2026-11-12T08:00:00Z', '12 ноября'],
    ['2026-03-01T08:00:00Z', '1 марта'],
    ['2025-12-31T08:00:00Z', '31 декабря 2025'],
  ])('%s → «%s»', (iso, expected) => {
    expect(formatDayHeading(new Date(iso), now, zone)).toBe(expected)
  })

  it('день из будущего показывает датой', () => {
    expect(formatDayHeading(new Date('2026-11-20T08:00:00Z'), now, zone)).toBe('20 ноября')
  })

  it('«сегодня» считается в часовом поясе чата', () => {
    expect(formatDayHeading(new Date('2026-11-16T21:30:00Z'), now, zone)).toBe('Сегодня')
  })
})
