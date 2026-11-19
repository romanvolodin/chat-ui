<script setup lang="ts">
import type { ChatId, OpenChat } from '../../types'
import ChatFooter from './ChatFooter.vue'
import ChatHeader from './ChatHeader.vue'

defineProps<{ chat: OpenChat }>()

const emit = defineEmits<{
  closeChat: []
  setChatMuted: [payload: { chatId: ChatId; isMuted: boolean }]
  joinChat: [payload: { chatId: ChatId }]
  unpinAllMessages: [payload: { chatId: ChatId }]
}>()
</script>

<template>
  <div class="chat-view">
    <ChatHeader :chat="chat" @close-chat="emit('closeChat')" />
    <ChatFooter
      :chat="chat"
      @set-chat-muted="emit('setChatMuted', $event)"
      @join-chat="emit('joinChat', $event)"
      @unpin-all-messages="emit('unpinAllMessages', $event)"
    />
  </div>
</template>

<style>
.chat-view {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>
