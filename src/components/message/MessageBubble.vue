<script setup lang="ts">
import { computed } from 'vue'
import type { UserId, UserMessage } from '../../types'
import MessageMeta from './MessageMeta.vue'
import MessageText from './MessageText.vue'

const props = withDefaults(
  defineProps<{
    message: UserMessage
    isOutgoing?: boolean
    /** Первое и последнее сообщение подряд идущих одного автора: от них зависят углы пузыря. */
    isFirstInGroup?: boolean
    isLastInGroup?: boolean
  }>(),
  { isOutgoing: false, isFirstInGroup: true, isLastInGroup: true },
)

const emit = defineEmits<{ openUser: [payload: { userId: UserId }] }>()

const meta = computed(() => ({
  sentAt: props.message.sentAt,
  status: props.message.status,
  editedAt: props.message.editedAt,
  isPinned: props.message.isPinned,
  viewCount: props.message.viewCount,
}))
</script>

<template>
  <div
    class="chat-bubble"
    :class="[
      isOutgoing ? 'chat-bubble--outgoing' : 'chat-bubble--incoming',
      {
        'chat-bubble--joined-before': !isFirstInGroup,
        'chat-bubble--joined-after': !isLastInGroup,
      },
    ]"
  >
    <MessageText
      v-if="message.text?.length"
      :text="message.text"
      @open-user="emit('openUser', $event)"
    >
      <template #trailing>
        <MessageMeta class="chat-bubble__meta" v-bind="meta" />
      </template>
    </MessageText>
    <MessageMeta v-else class="chat-bubble__meta" v-bind="meta" />
  </div>
</template>

<style>
.chat-bubble {
  display: flow-root;
  border-radius: var(--chat-bubble-radius);
  background-color: var(--chat-bubble-incoming-background);
  padding: var(--chat-bubble-padding);
  width: fit-content;
  max-width: var(--chat-bubble-max-width);
  color: var(--chat-text-color);
}

.chat-bubble--incoming {
  align-self: flex-start;
}

.chat-bubble--outgoing {
  align-self: flex-end;
  background-color: var(--chat-bubble-outgoing-background);
}

/* Углы со стороны автора: внутри группы скруглены слабее, у последнего сообщения «хвостик» */
.chat-bubble--incoming.chat-bubble--joined-before {
  border-top-left-radius: var(--chat-bubble-radius-joined);
}

.chat-bubble--incoming.chat-bubble--joined-after {
  border-bottom-left-radius: var(--chat-bubble-radius-joined);
}

.chat-bubble--incoming:not(.chat-bubble--joined-after) {
  border-bottom-left-radius: var(--chat-bubble-radius-tail);
}

.chat-bubble--outgoing.chat-bubble--joined-before {
  border-top-right-radius: var(--chat-bubble-radius-joined);
}

.chat-bubble--outgoing.chat-bubble--joined-after {
  border-bottom-right-radius: var(--chat-bubble-radius-joined);
}

.chat-bubble--outgoing:not(.chat-bubble--joined-after) {
  border-bottom-right-radius: var(--chat-bubble-radius-tail);
}

/* Мета стоит в потоке текста и прижата вправо:
   время встаёт в конец последней строки или переносится под неё */
.chat-bubble__meta {
  float: right;
  margin: 8px -2px -4px 14px;
}

.chat-bubble > .chat-bubble__meta {
  margin-top: 0;
}
</style>
