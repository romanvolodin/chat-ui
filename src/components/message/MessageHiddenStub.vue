<script setup lang="ts">
import type { MessageId } from '../../types'

defineProps<{ messageId: MessageId }>()
</script>

<template>
  <div class="chat-hidden-stub" :data-message-id="messageId">Сообщение скрыто</div>
</template>

<style>
.chat-hidden-stub {
  align-self: flex-start;
  border-radius: var(--chat-bubble-radius);
  background-color: var(--chat-overlay-background);
  padding: 2px 12px;
  color: var(--chat-overlay-color);
  font-size: 0.9em;
}
</style>
