import { inject, onScopeDispose, provide, readonly, ref, type InjectionKey, type Ref } from 'vue'

export interface ToastController {
  /** Текст показанного уведомления, `undefined`, если сейчас ничего нет. */
  message: Readonly<Ref<string | undefined>>
  show: (text: string) => void
}

const key: InjectionKey<ToastController> = Symbol('chat-toast')

const DEFAULT_DURATION = 2500

function createToastController(duration: number): ToastController {
  const message = ref<string>()
  let timer: ReturnType<typeof setTimeout> | undefined

  onScopeDispose(() => {
    clearTimeout(timer)
  })

  return {
    message: readonly(message),
    // Новое уведомление заменяет прежнее и заново отсчитывает время
    show(text) {
      clearTimeout(timer)
      message.value = text
      timer = setTimeout(() => {
        message.value = undefined
      }, duration)
    },
  }
}

/** Корень чата заводит одно уведомление на весь чат; вложенные компоненты показывают его через `useToast`. */
export function provideToast(duration = DEFAULT_DURATION): ToastController {
  const controller = createToastController(duration)
  provide(key, controller)
  return controller
}

const silent: ToastController = { message: readonly(ref<string>()), show: () => undefined }

/** Вне корня чата (в историях, в тестах) уведомления просто не показываются. */
export function useToast(): ToastController {
  return inject(key, silent)
}
