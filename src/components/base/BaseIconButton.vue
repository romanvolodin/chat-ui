<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import type { IconName } from './icons'

withDefaults(
  defineProps<{
    icon: IconName
    label: string
    size?: number
    isDisabled?: boolean
  }>(),
  { size: 40, isDisabled: false },
)
</script>

<template>
  <button
    class="chat-icon-button"
    type="button"
    :aria-label="label"
    :disabled="isDisabled"
    :style="{ '--chat-icon-button-size': `${size}px` }"
  >
    <BaseIcon :name="icon" :size="Math.round(size * 0.6)" />
  </button>
</template>

<style>
.chat-icon-button {
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0;
  border: none;
  border-radius: 50%;
  background: none;
  padding: 0;
  width: var(--chat-icon-button-size);
  height: var(--chat-icon-button-size);
  color: var(--chat-icon-color);
}

.chat-icon-button:hover:not(:disabled) {
  background-color: var(--chat-surface-hover);
}

.chat-icon-button:focus-visible {
  outline: 2px solid var(--chat-accent);
  outline-offset: 2px;
}

.chat-icon-button:disabled {
  cursor: default;
  opacity: 0.4;
}
</style>
