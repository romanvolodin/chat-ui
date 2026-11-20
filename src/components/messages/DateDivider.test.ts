import { afterEach, describe, expect, it } from 'vitest'
import { sampleNow } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import DateDivider from './DateDivider.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(date: Date) {
  mounted = mountWithChatContext(DateDivider, { date })
  return mounted.container.querySelector('time')
}

describe('DateDivider', () => {
  it('сегодняшний день называет «Сегодня»', () => {
    expect(mount(sampleNow)?.textContent).toBe('Сегодня')
  })

  it('вчерашний день называет «Вчера»', () => {
    expect(mount(new Date(sampleNow.getTime() - 24 * 60 * 60_000))?.textContent).toBe('Вчера')
  })

  it('более ранний день показывает датой', () => {
    expect(mount(new Date('2026-11-12T08:00:00Z'))?.textContent).toBe('12 ноября')
  })

  it('записывает день в datetime', () => {
    expect(mount(new Date('2026-11-12T08:00:00Z'))?.getAttribute('datetime')).toBe('2026-11-12')
  })
})
