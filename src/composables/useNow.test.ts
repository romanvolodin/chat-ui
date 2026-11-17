import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, ref, type App } from 'vue'
import { useNow } from './useNow'

let app: App | undefined

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-17T10:00:00Z'))
})

afterEach(() => {
  app?.unmount()
  app = undefined
  vi.useRealTimers()
})

function mountWith(frozen: () => Date | undefined) {
  let now: ReturnType<typeof useNow> | undefined
  app = createApp(
    defineComponent({
      setup() {
        now = useNow(frozen)
        return () => h('div')
      },
    }),
  )
  app.mount(document.createElement('div'))
  if (!now) throw new Error('useNow не вызван')
  return now
}

describe('useNow', () => {
  it('без замороженного момента показывает реальное время', () => {
    expect(mountWith(() => undefined).value.toISOString()).toBe('2026-11-17T10:00:00.000Z')
  })

  it('обновляет реальное время раз в минуту', () => {
    const now = mountWith(() => undefined)
    vi.advanceTimersByTime(60_000)
    expect(now.value.toISOString()).toBe('2026-11-17T10:01:00.000Z')
  })

  it('замороженный момент не идёт', () => {
    const frozen = new Date('2026-01-01T12:00:00Z')
    const now = mountWith(() => frozen)
    vi.advanceTimersByTime(5 * 60_000)
    expect(now.value).toBe(frozen)
  })

  it('следит за изменением замороженного момента', () => {
    const frozen = ref<Date | undefined>(new Date('2026-01-01T12:00:00Z'))
    const now = mountWith(() => frozen.value)
    frozen.value = new Date('2026-02-02T12:00:00Z')
    expect(now.value.toISOString()).toBe('2026-02-02T12:00:00.000Z')
    frozen.value = undefined
    expect(now.value.toISOString()).toBe('2026-11-17T10:00:00.000Z')
  })

  it('останавливает часы при размонтировании', () => {
    mountWith(() => undefined)
    expect(vi.getTimerCount()).toBe(1)
    app?.unmount()
    app = undefined
    expect(vi.getTimerCount()).toBe(0)
  })
})
