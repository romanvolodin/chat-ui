<script setup lang="ts">
import { computed } from 'vue'
import { provideChatContext } from '../composables/chatContext'
import type { ChatEvents, ChatRootProps } from '../types'
import ChatSidebar from './chats/ChatSidebar.vue'

const props = defineProps<ChatRootProps>()

const emit = defineEmits<ChatEvents>()

provideChatContext(props)

// В узком экране видна одна панель: диалог или список чатов
const pane = computed(() => (props.openChat ? 'chat' : 'list'))
</script>

<template>
  <div class="chat-root chat-root--instance">
    <div class="chat-root__layout" :data-pane="pane">
      <div class="chat-root__sidebar">
        <ChatSidebar
          :chats="chats"
          :selected-chat-id="openChat?.id"
          :search-results="searchResults"
          :loading-lists="loadingLists"
          @select-chat="emit('selectChat', $event)"
          @search="emit('search', $event)"
          @open-user="emit('openUser', $event)"
          @go-to-message="emit('goToMessage', $event)"
          @reached-bottom="emit('reachedBottom', $event)"
        />
      </div>
      <div class="chat-root__view">
        <p v-if="!openChat" class="chat-root__empty">Выберите чат</p>
      </div>
    </div>
  </div>
</template>

<style>
/* Отдельный класс, чтобы стили экземпляра не попадали на обёртку `.chat-root` в историях Storybook */
.chat-root--instance {
  container-type: inline-size;
  background:
    var(--chat-background-image) center,
    var(--chat-background-gradient);
  background-blend-mode: var(--chat-background-blend-mode);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chat-root__layout {
  display: grid;
  grid-template-columns: var(--chat-sidebar-width) minmax(0, 1fr);
  height: 100%;
}

.chat-root__sidebar,
.chat-root__view {
  min-width: 0;
  min-height: 0;
}

.chat-root__view {
  display: grid;
}

.chat-root__empty {
  place-self: center;
  margin: 0;
  border-radius: 50vh;
  background-color: var(--chat-overlay-background);
  padding: 5px 20px;
  color: var(--chat-overlay-color);
}

/* @container не принимает переменные, поэтому порог ширины задан только здесь */
@container (max-width: 700px) {
  .chat-root__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Оба слоя в одной ячейке; скрытый остаётся в потоке, поэтому прокрутка списка не сбрасывается */
  .chat-root__sidebar,
  .chat-root__view {
    grid-area: 1 / 1;
  }

  .chat-root__layout[data-pane='list'] > .chat-root__view,
  .chat-root__layout[data-pane='chat'] > .chat-root__sidebar {
    visibility: hidden;
  }
}
</style>
