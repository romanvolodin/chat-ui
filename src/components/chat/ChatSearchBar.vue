<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { MessageId, SearchResults, SearchScope } from '../../types'
import BaseIconButton from '../base/BaseIconButton.vue'
import BaseSearchInput from '../base/BaseSearchInput.vue'
import BaseSpinner from '../base/BaseSpinner.vue'

const props = withDefaults(
  defineProps<{
    /** Результаты поиска из данных. Подходят только внутричатовые с тем же запросом, остальные игнорируются. */
    results?: SearchResults
    /** Движок ищет: пока так, вместо счётчика индикатор. */
    isLoading?: boolean
  }>(),
  { results: undefined, isLoading: false },
)

const emit = defineEmits<{
  search: [payload: { query: string; scope: SearchScope }]
  goToMessage: [payload: { messageId: MessageId }]
  close: []
}>()

/** Через сколько после последней буквы уходит запрос, мс. По Enter он уходит сразу. */
const SEARCH_DELAY = 300

const input = useTemplateRef<InstanceType<typeof BaseSearchInput>>('input')
const query = ref('')
const lastSentQuery = ref<string>()
const activeIndex = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined

// Результаты привязаны к запросу: ответ на уже устаревший запрос показывать нельзя
const messageIds = computed(() =>
  props.results?.scope === 'chat' && props.results.query === lastSentQuery.value
    ? props.results.messageIds
    : undefined,
)
const hasResults = computed(() => (messageIds.value?.length ?? 0) > 0)

const counter = computed(() => {
  if (!messageIds.value) return ''
  if (messageIds.value.length === 0) return 'Ничего не найдено'
  return `${String(activeIndex.value + 1)} из ${String(messageIds.value.length)}`
})

function goToActive() {
  const messageId = messageIds.value?.[activeIndex.value]
  if (messageId !== undefined) emit('goToMessage', { messageId })
}

// Пришли результаты (в том числе новые на тот же запрос): начинаем с первого и сразу показываем его
watch(messageIds, () => {
  activeIndex.value = 0
  goToActive()
})

function send() {
  clearTimeout(timer)
  if (query.value.trim() === '') {
    lastSentQuery.value = undefined
    return
  }
  if (query.value === lastSentQuery.value) return
  lastSentQuery.value = query.value
  emit('search', { query: query.value, scope: 'chat' })
}

watch(query, () => {
  clearTimeout(timer)
  if (query.value.trim() === '') lastSentQuery.value = undefined
  else timer = setTimeout(send, SEARCH_DELAY)
})

/** Порядок результатов задаёт движок: от новых к старым. Шаг +1 ведёт к более раннему, −1 к более позднему. */
function step(delta: 1 | -1) {
  const count = messageIds.value?.length ?? 0
  if (count === 0) return
  activeIndex.value = (activeIndex.value + delta + count) % count
  goToActive()
}

// Enter: новый текст ищем сразу, а тот же самый листает результаты дальше
function onSubmit() {
  if (query.value.trim() === '') return
  if (query.value === lastSentQuery.value) step(1)
  else send()
}

onMounted(() => {
  input.value?.focus()
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <div class="chat-search-bar" @keydown.esc="emit('close')">
    <BaseSearchInput
      ref="input"
      v-model="query"
      class="chat-search-bar__input"
      placeholder="Поиск по чату"
      @submit="onSubmit"
    />
    <div class="chat-search-bar__status" role="status" aria-live="polite">
      <BaseSpinner v-if="isLoading" />
      <span v-else>{{ counter }}</span>
    </div>
    <BaseIconButton
      icon="chevron-up"
      label="Более раннее сообщение"
      :size="36"
      :is-disabled="!hasResults"
      @click="step(1)"
    />
    <BaseIconButton
      icon="chevron-down"
      label="Более позднее сообщение"
      :size="36"
      :is-disabled="!hasResults"
      @click="step(-1)"
    />
    <BaseIconButton icon="close" label="Закрыть поиск" :size="36" @click="emit('close')" />
  </div>
</template>

<style>
.chat-search-bar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  border-top: 1px solid var(--chat-border-color, #0000000f);
  background-color: var(--chat-surface);
  padding: 6px 8px 6px 16px;
}

.chat-search-bar__input {
  flex: 1;
  min-width: 0;
}

.chat-search-bar__status {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  min-width: 90px;
  color: var(--chat-text-muted);
  font-size: 0.9em;
  white-space: nowrap;
}
</style>
