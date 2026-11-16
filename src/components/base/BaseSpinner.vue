<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 24 })
</script>

<template>
  <svg
    class="chat-spinner"
    :style="{ '--chat-spinner-size': `${size}px` }"
    viewBox="0 0 24 24"
    role="status"
    aria-label="Загрузка"
  >
    <circle cx="12" cy="12" r="9" />
  </svg>
</template>

<style>
.chat-spinner {
  flex-shrink: 0;
  animation: chat-spinner-rotate 0.8s linear infinite;
  width: var(--chat-spinner-size);
  height: var(--chat-spinner-size);
  fill: none;
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 38 100;
}

@keyframes chat-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-spinner {
    animation-duration: 2.4s;
  }
}
</style>
