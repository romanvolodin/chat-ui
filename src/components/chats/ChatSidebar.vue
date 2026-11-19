<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Chat, ChatId, ListId, MessageId, SearchResults, UserId } from '../../types'
import BaseSpinner from '../base/BaseSpinner.vue'
import ChatSearch from '../search/ChatSearch.vue'
import SearchResultsList from '../search/SearchResultsList.vue'
import ChatList from './ChatList.vue'

const props = withDefaults(
  defineProps<{
    chats: Chat[]
    selectedChatId?: ChatId
    searchResults?: SearchResults
    loadingLists?: ListId[]
  }>(),
  { selectedChatId: undefined, searchResults: undefined, loadingLists: () => [] },
)

const emit = defineEmits<{
  selectChat: [payload: { chatId: ChatId }]
  search: [payload: { query: string; scope: 'global' }]
  openUser: [payload: { userId: UserId }]
  goToMessage: [payload: { messageId: MessageId }]
  reachedBottom: [payload: { list: ListId }]
}>()

const query = ref('')

const isSearching = computed(() => query.value.trim() !== '')

// Результаты привязаны к точному тексту запроса: чужие игнорируем
const matchingResults = computed(() => {
  const results = props.searchResults
  return results?.scope === 'global' && results.query === query.value ? results : undefined
})
</script>

<template>
  <div class="chat-sidebar">
    <ChatSearch v-model="query" @search="emit('search', $event)" />
    <div class="chat-sidebar__body">
      <template v-if="isSearching">
        <SearchResultsList
          v-if="matchingResults"
          :results="matchingResults"
          :known-chats="chats"
          :is-loading="loadingLists.includes('searchResults')"
          @select-chat="emit('selectChat', $event)"
          @open-user="emit('openUser', $event)"
          @go-to-message="emit('goToMessage', $event)"
        />
        <div v-else-if="loadingLists.includes('searchResults')" class="chat-sidebar__loading">
          <BaseSpinner />
        </div>
      </template>
      <ChatList
        v-else
        :chats="chats"
        :selected-chat-id="selectedChatId"
        :is-loading="loadingLists.includes('chats')"
        @select="emit('selectChat', { chatId: $event })"
        @reached-bottom="emit('reachedBottom', { list: 'chats' })"
      />
    </div>
  </div>
</template>

<style>
.chat-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--chat-surface);
  height: 100%;
}

.chat-sidebar__body {
  flex: 1;
  min-height: 0;
}

.chat-sidebar__loading {
  display: flex;
  justify-content: center;
  padding: 16px;
  color: var(--chat-text-muted);
}
</style>
