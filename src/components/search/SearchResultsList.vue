<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { Chat, ChatId, MessageId, SearchResults, UserId } from '../../types'
import { formatChatListTime } from '../../utils/dateTime'
import { chatListExcerpt, excerptText, UNKNOWN_USER_NAME } from '../../utils/excerpt'
import BaseSpinner from '../base/BaseSpinner.vue'
import ChatListItem from '../chats/ChatListItem.vue'
import SearchResultItem from './SearchResultItem.vue'

type GlobalResults = Extract<SearchResults, { scope: 'global' }>

const props = withDefaults(
  defineProps<{
    results: GlobalResults
    /** Чаты, известные интерфейсу: по ним подписываются найденные сообщения. */
    knownChats?: Chat[]
    isLoading?: boolean
  }>(),
  { knownChats: () => [], isLoading: false },
)

const emit = defineEmits<{
  selectChat: [payload: { chatId: ChatId }]
  openUser: [payload: { userId: UserId }]
  goToMessage: [payload: { messageId: MessageId }]
}>()

const { users, currentUserId, now, timeZone } = useChatContext()

const isEmpty = computed(
  () =>
    props.results.chats.length === 0 &&
    props.results.users.length === 0 &&
    props.results.messages.length === 0,
)

const chatsById = computed(() => {
  const byId = new Map<ChatId, Chat>()
  for (const chat of [...props.knownChats, ...props.results.chats]) byId.set(chat.id, chat)
  return byId
})

const userRows = computed(() =>
  props.results.users.map((userId) => {
    const user = users.value[userId]
    return {
      userId,
      title: user?.name ?? UNKNOWN_USER_NAME,
      avatarSrc: user?.avatar,
      isOnline: user?.isOnline === true,
    }
  }),
)

const messageRows = computed(() =>
  props.results.messages.map((message) => {
    const chat = chatsById.value.get(message.chatId)
    const author = message.excerpt.authorId ? users.value[message.excerpt.authorId] : undefined
    return {
      messageId: message.messageId,
      title: chat?.title ?? author?.name ?? UNKNOWN_USER_NAME,
      subtitle: chat
        ? chatListExcerpt(message.excerpt, {
            chatType: chat.type,
            users: users.value,
            currentUserId: currentUserId.value,
          })
        : excerptText(message.excerpt),
      avatarSrc: chat ? chat.avatar : author?.avatar,
      time: formatChatListTime(message.sentAt, now.value, timeZone.value),
    }
  }),
)
</script>

<template>
  <div class="chat-search-results">
    <div v-if="isLoading" class="chat-search-results__loading"><BaseSpinner /></div>
    <p v-if="isEmpty && !isLoading" class="chat-search-results__empty">Ничего не найдено</p>

    <section v-if="results.chats.length > 0">
      <h3 class="chat-search-results__heading">Чаты</h3>
      <ChatListItem
        v-for="chat in results.chats"
        :key="chat.id"
        :chat="chat"
        @click="emit('selectChat', { chatId: chat.id })"
      />
    </section>

    <section v-if="userRows.length > 0">
      <h3 class="chat-search-results__heading">Пользователи</h3>
      <SearchResultItem
        v-for="row in userRows"
        :key="row.userId"
        :title="row.title"
        :avatar-src="row.avatarSrc"
        :is-online="row.isOnline"
        @click="emit('openUser', { userId: row.userId })"
      />
    </section>

    <section v-if="messageRows.length > 0">
      <h3 class="chat-search-results__heading">Сообщения</h3>
      <SearchResultItem
        v-for="row in messageRows"
        :key="row.messageId"
        :title="row.title"
        :subtitle="row.subtitle"
        :time="row.time"
        :avatar-src="row.avatarSrc"
        @click="emit('goToMessage', { messageId: row.messageId })"
      />
    </section>
  </div>
</template>

<style>
.chat-search-results {
  background-color: var(--chat-surface);
  height: 100%;
  overflow-y: auto;
}

.chat-search-results__heading {
  margin: 0;
  padding: 12px 12px 6px;
  color: var(--chat-text-muted);
  font-weight: 500;
  font-size: 14px;
}

.chat-search-results__loading {
  display: flex;
  justify-content: center;
  padding: 16px;
  color: var(--chat-text-muted);
}

.chat-search-results__empty {
  margin: 0;
  padding: 24px 12px;
  color: var(--chat-text-muted);
  text-align: center;
}
</style>
