<script setup lang="ts">
import type { OpenChat } from '../../types'
import ChatHeader from './ChatHeader.vue'

defineProps<{ chat: OpenChat }>()

const emit = defineEmits<{ closeChat: [] }>()
</script>

<template>
  <div class="chat-view">
    <ChatHeader :chat="chat" @close-chat="emit('closeChat')" />
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
