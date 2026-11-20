<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { SystemMessage, UserId } from '../../types'
import { UNKNOWN_USER_NAME } from '../../utils/excerpt'
import BasePill from '../base/BasePill.vue'
import MessageText from '../message/MessageText.vue'

const props = defineProps<{ message: SystemMessage }>()

const emit = defineEmits<{ openUser: [payload: { userId: UserId }] }>()

const { users } = useChatContext()

const authorName = computed(() =>
  props.message.authorId === undefined
    ? undefined
    : (users.value[props.message.authorId]?.name ?? UNKNOWN_USER_NAME),
)
</script>

<template>
  <div class="chat-system-message">
    <BasePill>
      <button
        v-if="message.authorId !== undefined"
        class="chat-system-message__author"
        type="button"
        @click="emit('openUser', { userId: message.authorId })"
      >
        {{ authorName }}
      </button>
      <MessageText :text="message.text" @open-user="emit('openUser', $event)" />
    </BasePill>
  </div>
</template>

<style>
.chat-system-message {
  display: flex;
  justify-content: center;
}

.chat-system-message .chat-message-text {
  display: inline;
}

.chat-system-message__author {
  cursor: pointer;
  margin: 0;
  border: none;
  background: none;
  padding: 0;
  color: inherit;
  font: inherit;
  font-weight: 700;
}

.chat-system-message__author:focus-visible {
  outline: 2px solid var(--chat-accent);
}
</style>
