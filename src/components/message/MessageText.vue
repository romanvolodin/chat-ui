<script setup lang="ts">
import type { FormattedText, UserId } from '../../types'
import { orderFormats } from '../../utils/textFormat'
import MessageTextNode from './MessageTextNode.vue'

defineProps<{ text: FormattedText }>()

const emit = defineEmits<{ openUser: [payload: { userId: UserId }] }>()
</script>

<template>
  <div class="chat-message-text">
    <MessageTextNode
      v-for="(segment, index) in text"
      :key="index"
      :segment="segment"
      :formats="orderFormats(segment.format)"
      @open-user="emit('openUser', $event)"
    />
    <!-- Идёт сразу за последним словом: так время сообщения встаёт в конец последней строки -->
    <slot name="trailing" />
  </div>
</template>

<style>
.chat-message-text {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.chat-text-link,
.chat-text-mention {
  color: var(--chat-accent-text);
}

.chat-text-link {
  text-decoration: none;
}

.chat-text-link:hover {
  text-decoration: underline;
}

.chat-text-mention {
  cursor: pointer;
}

.chat-text-code,
.chat-text-code-block {
  border-radius: 5px;
  background-color: color-mix(in srgb, currentcolor 8%, transparent);
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.chat-text-code {
  padding: 1px 4px;
}

.chat-text-code-block {
  margin: 4px 0;
  padding: 6px 8px;
  overflow-x: auto;
  white-space: pre;
}

.chat-text-code-block code {
  font: inherit;
}

.chat-text-quote {
  margin: 4px 0;
  border-left: 3px solid var(--chat-accent);
  border-radius: 0 5px 5px 0;
  background-color: var(--chat-accent-tint);
  padding: 3px 8px;
}

.chat-text-spoiler:not(.chat-text-spoiler--revealed) {
  cursor: pointer;
  filter: blur(5px);
  user-select: none;
}

.chat-text-spoiler:focus-visible {
  outline: 2px solid var(--chat-accent);
}
</style>
