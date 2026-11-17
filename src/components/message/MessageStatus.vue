<script setup lang="ts">
import type { MessageStatus as Status } from '../../types'
import BaseIcon from '../base/BaseIcon.vue'
import type { IconName } from '../base/icons'

withDefaults(defineProps<{ status: Status; size?: number }>(), { size: 16 })

const views: Record<Status, { icon: IconName; label: string }> = {
  sending: { icon: 'clock', label: 'Отправляется' },
  sent: { icon: 'check', label: 'Отправлено' },
  read: { icon: 'check-double', label: 'Прочитано' },
  error: { icon: 'alert-circle', label: 'Ошибка отправки' },
}
</script>

<template>
  <span
    class="chat-message-status"
    :class="`chat-message-status--${status}`"
    role="img"
    :aria-label="views[status].label"
  >
    <BaseIcon :name="views[status].icon" :size="size" />
  </span>
</template>

<style>
.chat-message-status {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--chat-accent);
}

.chat-message-status--error {
  color: var(--chat-danger);
}
</style>
