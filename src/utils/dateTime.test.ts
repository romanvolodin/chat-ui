import { describe, expect, it } from 'vitest'
import { formatChatListTime, formatClock } from './dateTime'

const MOSCOW = 'Europe/Moscow'
const now = new Date('2026-11-17T12:00:00Z')

const format = (iso: string, at = now, timeZone: string | undefined = MOSCOW) =>
  formatChatListTime(new Date(iso), at, timeZone)

describe('formatClock', () => {
  it('показывает часы и минуты в часовом поясе чата', () => {
    expect(formatClock(new Date('2026-11-17T11:35:00Z'), MOSCOW)).toBe('14:35')
    expect(formatClock(new Date('2026-11-17T11:35:00Z'), 'Asia/Tokyo')).toBe('20:35')
  })

  it('дополняет часы и минуты нулями', () => {
    expect(formatClock(new Date('2026-11-17T02:05:00Z'), MOSCOW)).toBe('05:05')
  })

  it('показывает полночь как 00:00', () => {
    expect(formatClock(new Date('2026-11-16T21:00:00Z'), MOSCOW)).toBe('00:00')
  })
})

describe('formatChatListTime', () => {
  it('сегодня показывает время', () => {
    expect(format('2026-11-17T11:35:00Z')).toBe('14:35')
  })

  it('вчера показывает «Вчера»', () => {
    expect(format('2026-11-16T10:00:00Z')).toBe('Вчера')
  })

  it('считает сегодня и вчера в часовом поясе, а не по UTC', () => {
    expect(format('2026-11-16T21:30:00Z')).toBe('00:30')
    const afterMidnight = new Date('2026-11-17T21:30:00Z')
    expect(format('2026-11-17T11:35:00Z', afterMidnight)).toBe('Вчера')
  })

  it('от двух до шести дней назад показывает день недели', () => {
    expect(format('2026-11-15T10:00:00Z')).toBe('Вс')
    expect(format('2026-11-11T10:00:00Z')).toBe('Ср')
  })

  it('неделю назад и раньше показывает дату без года в этом году', () => {
    expect(format('2026-11-10T10:00:00Z')).toBe('10 ноя')
    expect(format('2026-03-05T10:00:00Z')).toBe('5 мар')
    expect(format('2026-05-20T10:00:00Z')).toBe('20 мая')
  })

  it('для прошлых лет добавляет год', () => {
    expect(format('2025-11-17T10:00:00Z')).toBe('17 ноя 2025')
    expect(format('2025-12-31T10:00:00Z')).toBe('31 дек 2025')
  })

  it('на границе года день недели побеждает, когда прошло меньше недели', () => {
    const newYear = new Date('2026-01-02T12:00:00Z')
    expect(format('2025-12-31T10:00:00Z', newYear)).toBe('Ср')
    expect(format('2025-12-20T10:00:00Z', newYear)).toBe('20 дек 2025')
  })

  it('сообщение из будущего показывает дату', () => {
    expect(format('2026-11-20T10:00:00Z')).toBe('20 ноя')
  })

  it('без часового пояса использует пояс устройства', () => {
    const moment = new Date('2026-11-17T11:35:00Z')
    expect(formatChatListTime(moment, moment)).toMatch(/^\d{2}:\d{2}$/)
  })
})
