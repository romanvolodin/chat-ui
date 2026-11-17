<script setup lang="ts">
import { computed } from 'vue'
import { getColorIndex, getInitials } from './avatarAppearance'

const props = withDefaults(
  defineProps<{
    name: string
    src?: string
    size?: number
    isOnline?: boolean
  }>(),
  { src: undefined, size: 50, isOnline: false },
)

const initials = computed(() => getInitials(props.name))
const colorClass = computed(
  () => `chat-avatar__initials--color-${String(getColorIndex(props.name))}`,
)
</script>

<template>
  <div class="chat-avatar" :style="{ '--chat-avatar-size': `${size}px` }">
    <img v-if="src" class="chat-avatar__image" :src="src" :alt="name" />
    <span v-else class="chat-avatar__initials" :class="colorClass">{{ initials }}</span>
    <span v-if="isOnline" class="chat-avatar__online"></span>
  </div>
</template>

<style>
.chat-avatar {
  position: relative;
  flex-shrink: 0;
  width: var(--chat-avatar-size);
  height: var(--chat-avatar-size);
}

.chat-avatar__image,
.chat-avatar__initials {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chat-avatar__image {
  object-fit: cover;
}

.chat-avatar__initials {
  color: var(--chat-avatar-text-color);
  font-size: calc(var(--chat-avatar-size) * 0.4);
  user-select: none;
}

.chat-avatar__initials--color-1 {
  background-color: var(--chat-avatar-color-1);
}

.chat-avatar__initials--color-2 {
  background-color: var(--chat-avatar-color-2);
}

.chat-avatar__initials--color-3 {
  background-color: var(--chat-avatar-color-3);
}

.chat-avatar__initials--color-4 {
  background-color: var(--chat-avatar-color-4);
}

.chat-avatar__initials--color-5 {
  background-color: var(--chat-avatar-color-5);
}

.chat-avatar__initials--color-6 {
  background-color: var(--chat-avatar-color-6);
}

.chat-avatar__online {
  position: absolute;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  border: calc(var(--chat-avatar-size) * 0.06) solid
    var(--chat-avatar-ring-color, var(--chat-surface));
  border-radius: 50%;
  background-color: var(--chat-online-dot-color);
  width: calc(var(--chat-avatar-size) * 0.32);
  height: calc(var(--chat-avatar-size) * 0.32);
}
</style>
