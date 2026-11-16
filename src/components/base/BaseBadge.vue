<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Приглушённый вид, например для чата с отключённым звуком. */
    isMuted?: boolean
  }>(),
  { isMuted: false },
)
</script>

<template>
  <span class="chat-badge" :class="{ 'chat-badge--muted': isMuted }"><slot /></span>
</template>

<style>
.chat-badge {
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: var(--chat-badge-background);
  padding: 0 6px;
  min-width: 20px;
  height: 20px;
  color: var(--chat-badge-color);
  font-weight: bold;
  font-size: 0.8em;
}

.chat-badge--muted {
  background-color: var(--chat-badge-muted-background);
}
</style>
