<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { Chat } from '../../types'
import { chatStatus } from '../../utils/chatStatus'

const props = defineProps<{ chat: Chat }>()

const { users, now, timeZone } = useChatContext()

const status = computed(() =>
  chatStatus(props.chat, { users: users.value, now: now.value, timeZone: timeZone.value }),
)
</script>

<template>
  <div
    v-if="status.text"
    class="chat-status-line"
    :class="{ 'chat-status-line--highlighted': status.isHighlighted }"
  >
    {{ status.text }}
  </div>
</template>

<style>
.chat-status-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--chat-text-muted);
}

.chat-status-line--highlighted {
  color: var(--chat-online-text-color);
}
</style>
