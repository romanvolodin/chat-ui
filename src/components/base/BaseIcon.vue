<script setup lang="ts">
import { icons, type IconName } from './icons'

withDefaults(
  defineProps<{
    name: IconName
    size?: number
  }>(),
  { size: 24 },
)
</script>

<template>
  <svg
    class="chat-icon"
    :style="{ '--chat-icon-size': `${size}px` }"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path v-for="(path, index) in icons[name]" :key="index" :d="path" />
  </svg>
</template>

<style>
.chat-icon {
  flex-shrink: 0;
  width: var(--chat-icon-size);
  height: var(--chat-icon-size);
  fill: none;
  stroke: currentcolor;
  stroke-width: var(--chat-icon-stroke-width);
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
