<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MessageId, PinnedMessage } from '../../types'
import { excerptText } from '../../utils/excerpt'
import BaseIconButton from '../base/BaseIconButton.vue'

const props = defineProps<{ pinned: PinnedMessage[] }>()

const emit = defineEmits<{
  goToMessage: [payload: { messageId: MessageId }]
  openPinned: []
}>()

/** Столько отметок слева показываем самое большее; при большем числе закреплённых отметка соответствует группе. */
const MAX_MARKS = 4

const activeIndex = ref(0)

// Закреплённых стало меньше (одно открепили): остаёмся в пределах списка
watch(
  () => props.pinned.length,
  (count) => {
    if (activeIndex.value >= count) activeIndex.value = 0
  },
)

const current = computed(() => props.pinned[activeIndex.value])
const hasSeveral = computed(() => props.pinned.length > 1)
const title = computed(() =>
  hasSeveral.value
    ? `Закреплённое сообщение #${String(activeIndex.value + 1)}`
    : 'Закреплённое сообщение',
)
const text = computed(() => (current.value ? excerptText(current.value.excerpt) : ''))

const marks = computed(() => {
  const count = Math.min(props.pinned.length, MAX_MARKS)
  const active = Math.floor((activeIndex.value * count) / props.pinned.length)
  return Array.from({ length: count }, (_, index) => index === active)
})

// Нажатие ведёт к показанному сообщению, а полоса переключается на следующее закреплённое
function goToCurrent() {
  const target = current.value
  if (!target) return
  emit('goToMessage', { messageId: target.messageId })
  activeIndex.value = (activeIndex.value + 1) % props.pinned.length
}
</script>

<template>
  <div v-if="current" class="chat-pinned-bar">
    <button
      class="chat-pinned-bar__main"
      type="button"
      :aria-label="`${title}: ${text}`"
      @click="goToCurrent"
    >
      <span class="chat-pinned-bar__marks" aria-hidden="true">
        <span
          v-for="(isActive, index) in marks"
          :key="index"
          class="chat-pinned-bar__mark"
          :class="{ 'chat-pinned-bar__mark--active': isActive }"
        ></span>
      </span>
      <span class="chat-pinned-bar__body">
        <span class="chat-pinned-bar__title">{{ title }}</span>
        <span class="chat-pinned-bar__text">{{ text }}</span>
      </span>
    </button>
    <BaseIconButton
      icon="menu"
      label="Закреплённые сообщения"
      :size="36"
      @click="emit('openPinned')"
    />
  </div>
</template>

<style>
.chat-pinned-bar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  border-top: 1px solid var(--chat-border-color, #0000000f);
  background-color: var(--chat-surface);
  padding: 0 8px 0 16px;
  color: var(--chat-text-color);
}

.chat-pinned-bar__main {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin: 0;
  border: none;
  background: none;
  padding: 6px 0;
  min-width: 0;
  text-align: left;
  color: inherit;
  font: inherit;
}

.chat-pinned-bar__main:focus-visible {
  outline: 2px solid var(--chat-accent);
}

.chat-pinned-bar__marks {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 2px;
  width: 3px;
  height: 32px;
}

.chat-pinned-bar__mark {
  flex: 1;
  border-radius: 2px;
  background-color: color-mix(in srgb, var(--chat-accent) 30%, transparent);
}

.chat-pinned-bar__mark--active {
  background-color: var(--chat-accent);
}

.chat-pinned-bar__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-pinned-bar__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--chat-accent-text);
  font-weight: 700;
  font-size: 0.9em;
}

.chat-pinned-bar__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9em;
}
</style>
