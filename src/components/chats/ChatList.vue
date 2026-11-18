<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import type { Chat, ChatId } from '../../types'
import BaseSpinner from '../base/BaseSpinner.vue'
import ChatListItem from './ChatListItem.vue'

const props = withDefaults(
  defineProps<{
    chats: Chat[]
    selectedChatId?: ChatId
    isLoading?: boolean
  }>(),
  { selectedChatId: undefined, isLoading: false },
)

const emit = defineEmits<{
  select: [chatId: ChatId]
  reachedBottom: []
}>()

const container = useTemplateRef('container')
const sentinel = useTemplateRef('sentinel')
let observer: IntersectionObserver | undefined
let isBottomVisible = false

function requestMoreIfBottomVisible() {
  if (isBottomVisible && !props.isLoading) emit('reachedBottom')
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      isBottomVisible = entry?.isIntersecting ?? false
      requestMoreIfBottomVisible()
    },
    { root: container.value, rootMargin: '0px 0px 200px 0px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

// Подгрузили чаты, а низ всё ещё виден: просим следующую порцию. Без роста списка не повторяем,
// иначе движок, у которого больше нечего отдавать, получал бы бесконечные запросы.
watch(
  () => props.chats.length,
  (length, previousLength) => {
    if (length > previousLength) requestMoreIfBottomVisible()
  },
  { flush: 'post' },
)
</script>

<template>
  <div ref="container" class="chat-list">
    <ul class="chat-list__items">
      <li v-for="chat in chats" :key="chat.id">
        <ChatListItem
          :chat="chat"
          :is-selected="chat.id === selectedChatId"
          @click="emit('select', chat.id)"
        />
      </li>
    </ul>
    <div v-if="isLoading" class="chat-list__loading"><BaseSpinner /></div>
    <div ref="sentinel" class="chat-list__sentinel"></div>
  </div>
</template>

<style>
.chat-list {
  background-color: var(--chat-surface);
  height: 100%;
  overflow-y: auto;
}

.chat-list__items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.chat-list__loading {
  display: flex;
  justify-content: center;
  padding: 16px;
  color: var(--chat-text-muted);
}

.chat-list__sentinel {
  height: 1px;
}
</style>
