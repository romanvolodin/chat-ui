import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import { useDebouncedFn } from './useDebouncedFn'

let app: App | undefined

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  app?.unmount()
  app = undefined
  vi.useRealTimers()
})

function setup(fn: (value: string) => void, delay = 300) {
  let debounced: ReturnType<typeof useDebouncedFn<[string]>> | undefined
  app = createApp({
    setup() {
      debounced = useDebouncedFn(fn, delay)
      return () => null
    },
  })
  app.mount(document.createElement('div'))
  if (!debounced) throw new Error('useDebouncedFn не вызван')
  return debounced
}

describe('useDebouncedFn', () => {
  it('вызывает функцию после паузы', () => {
    const fn = vi.fn()
    setup(fn).call('кни')
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledExactlyOnceWith('кни')
  })

  it('при серии вызовов передаёт только последний', () => {
    const fn = vi.fn()
    const debounced = setup(fn)
    debounced.call('к')
    vi.advanceTimersByTime(200)
    debounced.call('кн')
    vi.advanceTimersByTime(200)
    debounced.call('кни')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledExactlyOnceWith('кни')
  })

  it('flush вызывает сразу и отменяет ожидание', () => {
    const fn = vi.fn()
    const debounced = setup(fn)
    debounced.call('кни')
    debounced.flush()
    expect(fn).toHaveBeenCalledExactlyOnceWith('кни')
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('flush без ожидающего вызова ничего не делает', () => {
    const fn = vi.fn()
    setup(fn).flush()
    expect(fn).not.toHaveBeenCalled()
  })

  it('cancel отменяет ожидающий вызов', () => {
    const fn = vi.fn()
    const debounced = setup(fn)
    debounced.call('кни')
    debounced.cancel()
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })

  it('отменяет ожидание при размонтировании', () => {
    const fn = vi.fn()
    setup(fn).call('кни')
    app?.unmount()
    app = undefined
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })
})
