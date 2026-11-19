<script setup lang="ts">
import BaseAvatar from '../base/BaseAvatar.vue'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    time?: string
    avatarSrc?: string
    isOnline?: boolean
  }>(),
  { subtitle: undefined, time: undefined, avatarSrc: undefined, isOnline: false },
)
</script>

<template>
  <button class="chat-search-result" type="button">
    <BaseAvatar :name="title" :src="avatarSrc" :size="44" :is-online="isOnline" />
    <span class="chat-search-result__info">
      <span class="chat-search-result__row">
        <span class="chat-search-result__title">{{ title }}</span>
        <span v-if="time" class="chat-search-result__time">{{ time }}</span>
      </span>
      <span v-if="subtitle" class="chat-search-result__subtitle">{{ subtitle }}</span>
    </span>
  </button>
</template>

<style>
.chat-search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin: 0;
  border: none;
  background-color: var(--chat-surface);
  padding: 8px 12px;
  width: 100%;
  color: var(--chat-text-color);
  text-align: left;
  font: inherit;
}

.chat-search-result:hover {
  --chat-avatar-ring-color: var(--chat-surface-hover);
  background-color: var(--chat-surface-hover);
}

.chat-search-result:focus-visible {
  outline: 2px solid var(--chat-accent);
  outline-offset: -2px;
}

.chat-search-result__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.chat-search-result__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-search-result__title,
.chat-search-result__subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-search-result__title {
  flex: 1;
  min-width: 0;
  font-weight: 500;
  font-size: 16px;
}

.chat-search-result__time,
.chat-search-result__subtitle {
  color: var(--chat-text-muted);
}

.chat-search-result__time {
  flex-shrink: 0;
  font-size: 14px;
}
</style>
