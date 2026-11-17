const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MS_PER_DAY = 24 * 60 * 60 * 1000

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
