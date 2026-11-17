<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { Chat } from '../../types'
import { formatChatListTime } from '../../utils/dateTime'
import { chatListExcerpt } from '../../utils/excerpt'
import BaseAvatar from '../base/BaseAvatar.vue'
import BaseBadge from '../base/BaseBadge.vue'
import BaseIcon from '../base/BaseIcon.vue'
import MessageStatus from '../message/MessageStatus.vue'

const props = withDefaults(defineProps<{ chat: Chat; isSelected?: boolean }>(), {
  isSelected: false,
})

const { users, currentUserId, now, timeZone } = useChatContext()

const isOnline = computed(
  () => props.chat.peerId !== undefined && users.value[props.chat.peerId]?.isOnline === true,
)

const time = computed(() =>
  props.chat.lastMessage
    ? formatChatListTime(props.chat.lastMessage.sentAt, now.value, timeZone.value)
    : '',
)

const excerpt = computed(() =>
  props.chat.lastMessage
    ? chatListExcerpt(props.chat.lastMessage.excerpt, {
        chatType: props.chat.type,
        users: users.value,
        currentUserId: currentUserId.value,
      })
    : '',
)

const hasUnread = computed(() => (props.chat.unreadCount ?? 0) > 0)
const hasMention = computed(() => (props.chat.unreadMentionCount ?? 0) > 0)
</script>

<template>
  <button
    class="chat-list-item"
    :class="{ 'chat-list-item--selected': isSelected }"
    type="button"
    :aria-current="isSelected ? 'true' : undefined"
  >
    <BaseAvatar :name="chat.title" :src="chat.avatar" :is-online="isOnline" />
    <span class="chat-list-item__info">
      <span class="chat-list-item__row">
        <span class="chat-list-item__title">{{ chat.title }}</span>
        <BaseIcon
          v-if="chat.isMuted"
          class="chat-list-item__secondary"
          name="bell-off"
          :size="16"
        />
        <MessageStatus v-if="chat.lastMessage?.status" :status="chat.lastMessage.status" />
        <span v-if="time" class="chat-list-item__secondary chat-list-item__time">{{ time }}</span>
      </span>
      <span class="chat-list-item__row">
        <span class="chat-list-item__secondary chat-list-item__excerpt">{{ excerpt }}</span>
        <BaseBadge v-if="hasMention">@</BaseBadge>
        <BaseBadge v-if="hasUnread" :is-muted="chat.isMuted">{{ chat.unreadCount }}</BaseBadge>
        <BaseIcon
          v-if="chat.isPinned && !hasUnread && !hasMention"
          class="chat-list-item__secondary"
          name="pin"
          :size="18"
        />
      </span>
    </span>
  </button>
</template>

<style>
.chat-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin: 0;
  border: none;
  background-color: var(--chat-surface);
  padding: 12px;
  width: 100%;
  color: var(--chat-text-color);
  text-align: left;
  font: inherit;
}

.chat-list-item:hover {
  --chat-avatar-ring-color: var(--chat-surface-hover);
  background-color: var(--chat-surface-hover);
}

.chat-list-item:focus-visible {
  outline: 2px solid var(--chat-accent);
  outline-offset: -2px;
}

.chat-list-item--selected,
.chat-list-item--selected:hover {
  --chat-avatar-ring-color: var(--chat-accent);
  --chat-online-dot-color: var(--chat-on-accent);
  background-color: var(--chat-accent);
  color: var(--chat-on-accent);
}

.chat-list-item__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.chat-list-item__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-list-item__title,
.chat-list-item__excerpt {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-list-item__title {
  font-weight: bold;
  font-size: 18px;
}

.chat-list-item__time {
  flex-shrink: 0;
  white-space: nowrap;
}

.chat-list-item__secondary {
  color: var(--chat-text-muted);
}

.chat-list-item--selected .chat-list-item__secondary {
  color: var(--chat-on-accent-muted);
}

.chat-list-item--selected .chat-message-status {
  color: var(--chat-on-accent);
}
</style>
