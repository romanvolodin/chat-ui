<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { MessageStatus as Status } from '../../types'
import { formatClock } from '../../utils/dateTime'
import { formatCount } from '../../utils/formatCount'
import BaseIcon from '../base/BaseIcon.vue'
import MessageStatus from './MessageStatus.vue'

const props = withDefaults(
  defineProps<{
    sentAt: Date
    status?: Status
    editedAt?: Date
    isPinned?: boolean
    viewCount?: number
  }>(),
  { status: undefined, editedAt: undefined, isPinned: false, viewCount: undefined },
)

const { timeZone } = useChatContext()

const clock = computed(() => formatClock(props.sentAt, timeZone.value))
</script>

<template>
  <span class="chat-message-meta">
    <span v-if="viewCount !== undefined" class="chat-message-meta__faded chat-message-meta__views">
      <BaseIcon name="eye" :size="14" />
      {{ formatCount(viewCount) }}
    </span>
    <span v-if="isPinned" class="chat-message-meta__faded chat-message-meta__pin">
      <BaseIcon name="pin" :size="14" />
      <span class="chat-message-meta__sr-only">Закреплено</span>
    </span>
    <span v-if="editedAt" class="chat-message-meta__faded">изменено</span>
    <time class="chat-message-meta__faded" :datetime="sentAt.toISOString()">{{ clock }}</time>
    <MessageStatus v-if="status" :status="status" />
  </span>
</template>

<style>
.chat-message-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  white-space: nowrap;
  font-size: 0.85em;
  user-select: none;
}

.chat-message-meta__faded {
  opacity: var(--chat-time-opacity);
}

.chat-message-meta__views,
.chat-message-meta__pin {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.chat-message-meta__sr-only {
  position: absolute;
  margin: -1px;
  border: 0;
  padding: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
