<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { ChatEvents, MessageId, UserId, UserMessage } from '../../types'
import { UNKNOWN_USER_NAME } from '../../utils/excerpt'
import BaseAvatar from '../base/BaseAvatar.vue'
import { getColorIndex } from '../base/avatarAppearance'
import MessageItem from '../message/MessageItem.vue'

const props = withDefaults(
  defineProps<{
    /** Подряд идущие сообщения одного автора. */
    messages: UserMessage[]
    isOutgoing?: boolean
    /** Аватар и имя автора: нужны во входящих сообщениях групп и каналов, в личном чате их нет. */
    showAuthor?: boolean
  }>(),
  { isOutgoing: false, showAuthor: false },
)

const emit = defineEmits<{
  openUser: [payload: { userId: UserId }]
  goToMessage: [payload: { messageId: MessageId }]
  setReaction: ChatEvents['setReaction']
}>()

const { users } = useChatContext()

const authorId = computed(() => props.messages[0]?.authorId)
const author = computed(() =>
  authorId.value === undefined ? undefined : users.value[authorId.value],
)
const name = computed(() => author.value?.name ?? UNKNOWN_USER_NAME)
const nameColor = computed(() => `var(--chat-avatar-color-${String(getColorIndex(name.value))})`)

function openAuthor() {
  if (authorId.value !== undefined) emit('openUser', { userId: authorId.value })
}
</script>

<template>
  <div class="chat-message-group">
    <button
      v-if="showAuthor"
      class="chat-message-group__avatar"
      type="button"
      :aria-label="name"
      @click="openAuthor"
    >
      <BaseAvatar :name="author?.name ?? ''" :src="author?.avatar" :size="35" />
    </button>
    <div class="chat-message-group__bubbles">
      <MessageItem
        v-for="(message, index) in messages"
        :key="message.id"
        :message="message"
        :is-outgoing="isOutgoing"
        :is-first-in-group="index === 0"
        :is-last-in-group="index === messages.length - 1"
        @open-user="emit('openUser', $event)"
        @go-to-message="emit('goToMessage', $event)"
        @set-reaction="emit('setReaction', $event)"
      >
        <template v-if="showAuthor && index === 0" #header>
          <button
            class="chat-message-group__author"
            type="button"
            :style="{ color: nameColor }"
            @click="openAuthor"
          >
            {{ name }}
          </button>
        </template>
      </MessageItem>
    </div>
  </div>
</template>

<style>
.chat-message-group {
  display: flex;
  align-items: flex-end;
  gap: 7px;
}

.chat-message-group__avatar {
  display: flex;
  flex-shrink: 0;
  cursor: pointer;
  margin: 0;
  border: none;
  border-radius: 50%;
  background: none;
  padding: 0;
}

.chat-message-group__avatar:focus-visible,
.chat-message-group__author:focus-visible {
  outline: 2px solid var(--chat-accent);
}

.chat-message-group__bubbles {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--chat-bubble-gap);
  min-width: 0;
}

.chat-message-group__author {
  display: block;
  cursor: pointer;
  margin: 0;
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  font: inherit;
  font-weight: 700;
  font-size: 0.9em;
}
</style>
