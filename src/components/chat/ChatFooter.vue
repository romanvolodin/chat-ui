<script setup lang="ts">
import type { ChatEvents, ChatId, OpenChat } from '../../types'
import MessageComposer from '../composer/MessageComposer.vue'
import FooterActionBar from './FooterActionBar.vue'
import ReadOnlyNotice from './ReadOnlyNotice.vue'

const props = defineProps<{ chat: OpenChat }>()

const emit = defineEmits<{
  setChatMuted: [payload: { chatId: ChatId; isMuted: boolean }]
  joinChat: [payload: { chatId: ChatId }]
  unpinAllMessages: [payload: { chatId: ChatId }]
  changeDraft: ChatEvents['changeDraft']
  sendMessage: ChatEvents['sendMessage']
  editMessage: ChatEvents['editMessage']
}>()
</script>

<template>
  <footer v-if="chat.footer.type === 'input'" class="chat-footer chat-footer--composer">
    <MessageComposer
      :draft="chat.draft"
      @change-draft="emit('changeDraft', $event)"
      @send-message="emit('sendMessage', $event)"
      @edit-message="emit('editMessage', $event)"
    />
  </footer>
  <footer v-else class="chat-footer">
    <FooterActionBar
      v-if="chat.footer.type === 'mute'"
      :label="chat.isMuted ? 'Включить звук' : 'Отключить звук'"
      @click="emit('setChatMuted', { chatId: props.chat.id, isMuted: !props.chat.isMuted })"
    />
    <FooterActionBar
      v-else-if="chat.footer.type === 'join'"
      label="Присоединиться"
      @click="emit('joinChat', { chatId: props.chat.id })"
    />
    <FooterActionBar
      v-else-if="chat.footer.type === 'unpinAll'"
      label="Открепить все сообщения"
      @click="emit('unpinAllMessages', { chatId: props.chat.id })"
    />
    <ReadOnlyNotice v-else :text="chat.footer.text" />
  </footer>
</template>

<style>
.chat-footer {
  flex-shrink: 0;
  margin-top: auto;
  background-color: var(--chat-surface);
}

/* Поле ввода лежит прямо на фоне чата и стоит по центру, как лента сообщений */
.chat-footer--composer {
  box-sizing: border-box;
  margin: 0 auto var(--chat-composer-margin);
  background: none;
  padding: 0 var(--chat-composer-margin);
  width: 100%;
  max-width: var(--chat-dialog-max-width);
}
</style>
