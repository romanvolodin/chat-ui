import { pluralize } from './plural'

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MS_PER_MINUTE = 60 * 1000
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE

interface CalendarParts {
  year: number
  month: number
  day: number
  hour: string
  minute: string
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string | undefined) {
  const key = timeZone ?? ''
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    formatters.set(key, formatter)
  }
  return formatter
}

function calendarParts(date: Date, timeZone: string | undefined): CalendarParts {
  const parts = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: parts.hour ?? '00',
    minute: parts.minute ?? '00',
  }
}

const dayNumber = ({ year, month, day }: CalendarParts) =>
  Date.UTC(year, month - 1, day) / MS_PER_DAY

/** Время суток в формате `14:35`. */
export function formatClock(date: Date, timeZone?: string): string {
  const { hour, minute } = calendarParts(date, timeZone)
  return `${hour}:${minute}`
}

/**
 * Время последнего сообщения в списке чатов: сегодня `14:35`, вчера «Вчера», на этой неделе
 * день недели, дальше `17 ноя`, а для прошлых лет `17 ноя 2025`. «Сегодня» считается в часовом поясе чата.
 */
export function formatChatListTime(date: Date, now: Date, timeZone?: string): string {
  const parts = calendarParts(date, timeZone)
  const daysAgo = dayNumber(calendarParts(now, timeZone)) - dayNumber(parts)

  if (daysAgo === 0) return `${parts.hour}:${parts.minute}`
  if (daysAgo === 1) return 'Вчера'
  if (daysAgo >= 2 && daysAgo <= 6) {
    return WEEKDAYS[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()] ?? ''
  }

  const dayAndMonth = `${String(parts.day)} ${MONTHS[parts.month - 1] ?? ''}`
  const isSameYear = parts.year === calendarParts(now, timeZone).year
  return isSameYear ? dayAndMonth : `${dayAndMonth} ${String(parts.year)}`
}

/**
 * Хвост строки «был в сети …»: «только что», «5 минут назад», дальше «сегодня в 14:35»,
 * «вчера в 14:35», `12 ноя в 14:35`, а для прошлых лет `12 ноя 2025`. День считается в часовом поясе чата.
 */
export function formatLastSeen(date: Date, now: Date, timeZone?: string): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / MS_PER_MINUTE)
  if (minutes < 1) return 'только что'
  if (minutes < 60)
    return `${String(minutes)} ${pluralize(minutes, ['минуту', 'минуты', 'минут'])} назад`

  const parts = calendarParts(date, timeZone)
  const nowParts = calendarParts(now, timeZone)
  const clock = `${parts.hour}:${parts.minute}`
  const daysAgo = dayNumber(nowParts) - dayNumber(parts)

  if (daysAgo === 0) return `сегодня в ${clock}`
  if (daysAgo === 1) return `вчера в ${clock}`

  const dayAndMonth = `${String(parts.day)} ${MONTHS[parts.month - 1] ?? ''}`
  return parts.year === nowParts.year
    ? `${dayAndMonth} в ${clock}`
    : `${dayAndMonth} ${String(parts.year)}`
}

/** Ключ календарного дня в часовом поясе чата, например `2026-11-17`: по нему сообщения делятся на дни. */
export function getDayKey(date: Date, timeZone?: string): string {
  const { year, month, day } = calendarParts(date, timeZone)
  return `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Заголовок дня в ленте: «Сегодня», «Вчера», `17 ноября`, а для прошлых лет `17 ноября 2025`. */
export function formatDayHeading(date: Date, now: Date, timeZone?: string): string {
  const parts = calendarParts(date, timeZone)
  const nowParts = calendarParts(now, timeZone)
  const daysAgo = dayNumber(nowParts) - dayNumber(parts)

  if (daysAgo === 0) return 'Сегодня'
  if (daysAgo === 1) return 'Вчера'

  const dayAndMonth = `${String(parts.day)} ${MONTHS_GENITIVE[parts.month - 1] ?? ''}`
  return parts.year === nowParts.year ? dayAndMonth : `${dayAndMonth} ${String(parts.year)}`
}
