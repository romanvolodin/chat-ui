import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const TICK_MS = 60_000

/** Замороженный момент, если он задан, иначе реальные часы, обновляемые раз в минуту. */
export function useNow(frozen: () => Date | undefined): Readonly<Ref<Date>> {
  const clock = ref(new Date())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => {
      clock.value = new Date()
    }, TICK_MS)
  })

  onBeforeUnmount(() => {
    clearInterval(timer)
  })

  return computed(() => frozen() ?? clock.value)
}
