<script setup lang="ts">
import type { ChatEvents, ChatId, ListId, MessageId, OpenChat, UserId } from '../../types'
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
  readUntil: [payload: { messageId: MessageId }]
  goToMessage: [payload: { messageId: MessageId }]
  changeDraft: ChatEvents['changeDraft']
  sendMessage: ChatEvents['sendMessage']
  editMessage: ChatEvents['editMessage']
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
      @read-until="emit('readUntil', $event)"
      @go-to-message="emit('goToMessage', $event)"
    />
    <ChatFooter
      :chat="chat"
      @set-chat-muted="emit('setChatMuted', $event)"
      @join-chat="emit('joinChat', $event)"
      @unpin-all-messages="emit('unpinAllMessages', $event)"
      @change-draft="emit('changeDraft', $event)"
      @send-message="emit('sendMessage', $event)"
      @edit-message="emit('editMessage', $event)"
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
