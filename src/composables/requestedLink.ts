import { computed, ref, watch } from 'vue'
import type { ChatRootData } from '../types'
import { copyToClipboard } from '../utils/clipboard'
import type { ToastController } from './toast'

/**
 * Ответ движка на «Получить ссылку»: интерфейс кладёт адрес в буфер и говорит об этом. Если браузер запись
 * не разрешил, адрес показывается в окне для ручного копирования. Каждый ответ приходит новым объектом,
 * поэтому повторный запрос той же ссылки срабатывает снова.
 */
export function useRequestedLink(
  link: () => ChatRootData['requestedLink'],
  toast: ToastController,
) {
  const manualUrl = ref<string>()

  watch(link, async (requested) => {
    if (!requested) return
    if (await copyToClipboard(requested.url)) toast.show('Ссылка скопирована')
    else manualUrl.value = requested.url
  })

  const isManualDialogOpen = computed({
    get: () => manualUrl.value !== undefined,
    set: (isOpen) => {
      if (!isOpen) manualUrl.value = undefined
    },
  })

  return { manualUrl, isManualDialogOpen }
}
