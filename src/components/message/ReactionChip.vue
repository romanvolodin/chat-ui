<script setup lang="ts">
import { computed } from 'vue'
import type { Reaction } from '../../types'
import { formatCount } from '../../utils/formatCount'

const props = defineProps<{ reaction: Reaction }>()

const label = computed(() => {
  const { icon, count, isMine } = props.reaction
  const name = 'emoji' in icon ? icon.emoji : 'реакция'
  return `${name} ${String(count)}${isMine ? ', ваша реакция' : ''}`
})
</script>

<template>
  <button
    class="chat-reaction-chip"
    :class="{ 'chat-reaction-chip--mine': reaction.isMine }"
    type="button"
    :aria-pressed="reaction.isMine === true"
    :aria-label="label"
  >
    <span v-if="'emoji' in reaction.icon" class="chat-reaction-chip__emoji" aria-hidden="true">{{
      reaction.icon.emoji
    }}</span>
    <img
      v-else
      class="chat-reaction-chip__image"
      :src="reaction.icon.imageUrl"
      alt=""
      aria-hidden="true"
    />
    <span class="chat-reaction-chip__count">{{ formatCount(reaction.count) }}</span>
  </button>
</template>

<style>
.chat-reaction-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  margin: 0;
  border: none;
  border-radius: 50vh;
  background-color: var(--chat-reaction-background);
  padding: 2px 8px;
  height: 26px;
  color: var(--chat-reaction-color);
  font: inherit;
  font-size: 0.9em;
  font-weight: 500;
}

.chat-reaction-chip:hover {
  background-color: color-mix(in srgb, var(--chat-reaction-color) 25%, transparent);
}

.chat-reaction-chip--mine,
.chat-reaction-chip--mine:hover {
  background-color: var(--chat-reaction-color);
  color: var(--chat-on-accent);
}

.chat-reaction-chip:focus-visible {
  outline: 2px solid var(--chat-reaction-color);
  outline-offset: 1px;
}

.chat-reaction-chip__emoji {
  font-size: 1.1em;
  line-height: 1;
}

.chat-reaction-chip__image {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
</style>
