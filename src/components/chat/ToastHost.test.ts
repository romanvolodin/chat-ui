import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { provideToast, type ToastController } from '../../composables/toast'
import ToastHost from './ToastHost.vue'

afterEach(() => {
  vi.useRealTimers()
})

function mount() {
  let controller: ToastController | undefined
  const Root = defineComponent({
    setup() {
      controller = provideToast()
      return () => h(ToastHost)
    },
  })
  const container = document.createElement('div')
  createApp(Root).mount(container)
  if (!controller) throw new Error('Нет контроллера')
  return { container, controller }
}

describe('ToastHost', () => {
  it('область для скринридера есть и пока пуста', () => {
    const host = mount().container.querySelector('[role="status"]')
    expect(host?.getAttribute('aria-live')).toBe('polite')
    expect(host?.querySelector('.chat-toast')).toBeNull()
  })

  it('показывает уведомление', async () => {
    const { container, controller } = mount()
    controller.show('Ссылка скопирована')
    await nextTick()
    expect(container.querySelector('.chat-toast')?.textContent).toBe('Ссылка скопирована')
  })

  it('убирает уведомление, когда время вышло', async () => {
    vi.useFakeTimers()
    const { container, controller } = mount()
    controller.show('Ссылка скопирована')
    await nextTick()
    vi.advanceTimersByTime(2500)
    await nextTick()
    const toast = container.querySelector('.chat-toast')
    // Уходит плавно: в тестах переход не завершается, поэтому смотрим на его начало
    expect(toast === null || toast.classList.contains('chat-toast-leave-active')).toBe(true)
  })
})
