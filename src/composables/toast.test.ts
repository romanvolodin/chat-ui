/* eslint-disable vue/one-component-per-file -- проверяется обмен между родителем и потомком, для этого нужны два компонента */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { provideToast, useToast, type ToastController } from './toast'

let controller: ToastController | undefined
let consumer: ToastController | undefined

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  controller = undefined
  consumer = undefined
})

function mount(duration?: number) {
  const Child = defineComponent({
    setup() {
      consumer = useToast()
      return () => h('span')
    },
  })
  const Root = defineComponent({
    setup() {
      controller = provideToast(duration)
      return () => h(Child)
    },
  })
  const app = createApp(Root)
  app.mount(document.createElement('div'))
  return app
}

describe('toast', () => {
  it('сначала уведомления нет', () => {
    mount()
    expect(controller?.message.value).toBeUndefined()
  })

  it('показывает текст и убирает его через 2,5 секунды', () => {
    mount()
    controller?.show('Ссылка скопирована')
    expect(controller?.message.value).toBe('Ссылка скопирована')
    vi.advanceTimersByTime(2499)
    expect(controller?.message.value).toBe('Ссылка скопирована')
    vi.advanceTimersByTime(1)
    expect(controller?.message.value).toBeUndefined()
  })

  it('время можно задать', () => {
    mount(1000)
    controller?.show('Коротко')
    vi.advanceTimersByTime(1000)
    expect(controller?.message.value).toBeUndefined()
  })

  it('новое уведомление заменяет прежнее и заново отсчитывает время', () => {
    mount()
    controller?.show('Первое')
    vi.advanceTimersByTime(2000)
    controller?.show('Второе')
    vi.advanceTimersByTime(2000)
    expect(controller?.message.value).toBe('Второе')
    vi.advanceTimersByTime(500)
    expect(controller?.message.value).toBeUndefined()
  })

  it('вложенный компонент видит то же уведомление', () => {
    mount()
    controller?.show('Привет')
    expect(consumer?.message.value).toBe('Привет')
  })

  it('снаружи корня чата показ ничего не делает и не падает', () => {
    const Lonely = defineComponent({
      setup() {
        consumer = useToast()
        return () => h('span')
      },
    })
    createApp(Lonely).mount(document.createElement('div'))
    consumer?.show('Никто не увидит')
    expect(consumer?.message.value).toBeUndefined()
  })

  it('после размонтирования таймер не срабатывает', () => {
    const app = mount()
    controller?.show('Привет')
    app.unmount()
    expect(() => vi.advanceTimersByTime(3000)).not.toThrow()
  })
})
