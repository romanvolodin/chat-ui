<script setup lang="ts">
import { computed } from 'vue'
import { formatCount } from '../../utils/formatCount'
import BaseBadge from '../base/BaseBadge.vue'
import BaseIcon from '../base/BaseIcon.vue'

const props = withDefaults(defineProps<{ unreadCount?: number }>(), { unreadCount: 0 })

const label = computed(() =>
  props.unreadCount > 0 ? `Вниз, непрочитанных: ${String(props.unreadCount)}` : 'Вниз',
)
</script>

<template>
  <button class="chat-scroll-down" type="button" :aria-label="label">
    <BaseIcon name="chevron-down" :size="24" />
    <BaseBadge v-if="unreadCount > 0" class="chat-scroll-down__badge">
      {{ formatCount(unreadCount) }}
    </BaseBadge>
  </button>
</template>

<style>
.chat-scroll-down {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.25);
  margin: 0;
  border: none;
  border-radius: 50%;
  background-color: var(--chat-surface);
  padding: 0;
  width: 42px;
  height: 42px;
  color: var(--chat-text-muted);
}

.chat-scroll-down:hover {
  background-color: var(--chat-surface-hover);
}

.chat-scroll-down:focus-visible {
  outline: 2px solid var(--chat-accent);
}

.chat-scroll-down__badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
