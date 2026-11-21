<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { MessageId, UserId, UserMessage } from '../../types'
import MessageBubble from './MessageBubble.vue'
import MessageHiddenStub from './MessageHiddenStub.vue'

const props = withDefaults(
  defineProps<{
    message: UserMessage
    isOutgoing?: boolean
    isFirstInGroup?: boolean
    isLastInGroup?: boolean
  }>(),
  { isOutgoing: false, isFirstInGroup: true, isLastInGroup: true },
)

const emit = defineEmits<{
  openUser: [payload: { userId: UserId }]
  goToMessage: [payload: { messageId: MessageId }]
}>()

const { users } = useChatContext()

// Сообщения заблокированного автора остаются в данных, поэтому переход и прокрутка не ломаются, но их текста на экране нет
const isHidden = computed(() => users.value[props.message.authorId]?.isBlocked === true)
</script>

<template>
  <div class="chat-message-item">
    <MessageHiddenStub v-if="isHidden" :message-id="message.id" />
    <MessageBubble
      v-else
      :message="message"
      :is-outgoing="isOutgoing"
      :is-first-in-group="isFirstInGroup"
      :is-last-in-group="isLastInGroup"
      @open-user="emit('openUser', $event)"
      @go-to-message="emit('goToMessage', $event)"
    >
      <template v-if="$slots.header" #header><slot name="header" /></template>
    </MessageBubble>
  </div>
</template>

<style>
.chat-message-item {
  display: flex;
  flex-direction: column;
}
</style>
