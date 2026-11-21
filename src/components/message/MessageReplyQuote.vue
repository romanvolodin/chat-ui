<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { MessageId, ReplyTo } from '../../types'
import { UNKNOWN_USER_NAME, excerptText } from '../../utils/excerpt'
import { getColorIndex } from '../base/avatarAppearance'

const props = defineProps<{ replyTo: ReplyTo }>()

const emit = defineEmits<{ goToMessage: [payload: { messageId: MessageId }] }>()

const { users } = useChatContext()

const authorName = computed(() => {
  const { authorId, isSystem } = props.replyTo.excerpt
  if (isSystem || authorId === undefined) return undefined
  return users.value[authorId]?.name ?? UNKNOWN_USER_NAME
})
const text = computed(() => excerptText(props.replyTo.excerpt))
// Цвет автора тот же, что у его аватара и имени над сообщением
const color = computed(() =>
  authorName.value === undefined
    ? 'var(--chat-accent)'
    : `var(--chat-avatar-color-${String(getColorIndex(authorName.value))})`,
)
</script>

<template>
  <button
    class="chat-reply-quote"
    type="button"
    :style="{ '--chat-reply-quote-color': color }"
    @click="emit('goToMessage', { messageId: replyTo.messageId })"
  >
    <span v-if="authorName" class="chat-reply-quote__author">{{ authorName }}</span>
    <span class="chat-reply-quote__text">{{ text }}</span>
  </button>
</template>

<style>
.chat-reply-quote {
  display: block;
  cursor: pointer;
  margin: 0 0 4px;
  border: none;
  border-left: 2px solid var(--chat-reply-quote-color);
  border-radius: 0 5px 5px 0;
  background-color: color-mix(in srgb, var(--chat-reply-quote-color) 12%, transparent);
  padding: 2px 8px;
  width: 100%;
  text-align: left;
  color: inherit;
  font: inherit;
  font-size: 0.9em;
}

.chat-reply-quote:focus-visible {
  outline: 2px solid var(--chat-accent);
}

.chat-reply-quote__author {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--chat-reply-quote-color);
  font-weight: 700;
}

.chat-reply-quote__text {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
}
</style>
