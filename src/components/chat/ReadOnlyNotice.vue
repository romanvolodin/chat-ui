<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), { text: 'Вы не можете писать сообщения' })
</script>

<template>
  <div class="chat-read-only-notice">{{ text }}</div>
</template>

<style>
.chat-read-only-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  min-height: var(--chat-footer-bar-height);
  text-align: center;
  color: var(--chat-text-muted);
}
</style>
