<script setup lang="ts">
import type { ChatId, OpenChat } from '../../types'
import FooterActionBar from './FooterActionBar.vue'
import ReadOnlyNotice from './ReadOnlyNotice.vue'

const props = defineProps<{ chat: OpenChat }>()

const emit = defineEmits<{
  setChatMuted: [payload: { chatId: ChatId; isMuted: boolean }]
  joinChat: [payload: { chatId: ChatId }]
  unpinAllMessages: [payload: { chatId: ChatId }]
}>()
</script>

<template>
  <footer v-if="chat.footer.type !== 'input'" class="chat-footer">
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
</style>
