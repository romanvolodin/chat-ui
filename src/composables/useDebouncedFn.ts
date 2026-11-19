import { onBeforeUnmount } from 'vue'

export function useDebouncedFn<Args extends unknown[]>(fn: (...args: Args) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: Args | undefined

  function cancel() {
    clearTimeout(timer)
    timer = undefined
    pending = undefined
  }

  function flush() {
    if (!pending) return
    const args = pending
    cancel()
    fn(...args)
  }

  function call(...args: Args) {
    pending = args
    clearTimeout(timer)
    timer = setTimeout(flush, delay)
  }

  onBeforeUnmount(cancel)

  return { call, flush, cancel }
}
