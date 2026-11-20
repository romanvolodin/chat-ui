<script setup lang="ts">
import type { ChatId, ListId, OpenChat, UserId } from '../../types'
import MessageList from '../messages/MessageList.vue'
import ChatFooter from './ChatFooter.vue'
import ChatHeader from './ChatHeader.vue'

withDefaults(
  defineProps<{
    chat: OpenChat
    /** Движок подгружает сообщения этого чата. */
    isLoadingMessages?: boolean
  }>(),
  { isLoadingMessages: false },
)

const emit = defineEmits<{
  closeChat: []
  setChatMuted: [payload: { chatId: ChatId; isMuted: boolean }]
  joinChat: [payload: { chatId: ChatId }]
  unpinAllMessages: [payload: { chatId: ChatId }]
  openUser: [payload: { userId: UserId }]
  goToLatest: []
  reachedTop: [payload: { list: ListId }]
  reachedBottom: [payload: { list: ListId }]
}>()
</script>

<template>
  <div class="chat-view">
    <ChatHeader :chat="chat" @close-chat="emit('closeChat')" />
    <MessageList
      :chat="chat"
      :is-loading="isLoadingMessages"
      @open-user="emit('openUser', $event)"
      @go-to-latest="emit('goToLatest')"
      @reached-top="emit('reachedTop', $event)"
      @reached-bottom="emit('reachedBottom', $event)"
    />
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
