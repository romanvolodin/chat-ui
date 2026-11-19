<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { Chat } from '../../types'
import BaseAvatar from '../base/BaseAvatar.vue'
import BaseIconButton from '../base/BaseIconButton.vue'
import ChatStatusLine from './ChatStatusLine.vue'

const props = defineProps<{ chat: Chat }>()

const emit = defineEmits<{ closeChat: [] }>()

const { users } = useChatContext()

const isOnline = computed(
  () => props.chat.peerId !== undefined && users.value[props.chat.peerId]?.isOnline === true,
)
</script>

<template>
  <header class="chat-header">
    <!-- Кнопку «назад» показывает только узкая раскладка: ChatRoot задаёт --chat-back-button-display -->
    <span class="chat-header__back">
      <BaseIconButton icon="arrow-left" label="К списку чатов" @click="emit('closeChat')" />
    </span>
    <BaseAvatar :name="chat.title" :src="chat.avatar" :is-online="isOnline" />
    <div class="chat-header__info">
      <div class="chat-header__title">{{ chat.title }}</div>
      <ChatStatusLine :chat="chat" />
    </div>
  </header>
</template>

<style>
.chat-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  background-color: var(--chat-surface);
  padding: 0 16px;
  min-height: var(--chat-header-height);
  color: var(--chat-text-color);
}

.chat-header__back {
  display: var(--chat-back-button-display, none);
}

.chat-header__info {
  flex: 1;
  min-width: 0;
}

.chat-header__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  font-size: 1.1em;
}
</style>
