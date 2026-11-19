<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TextFormat, TextSegment, UserId } from '../../types'
import { linkHref } from '../../utils/linkHref'

// Рекурсивный компонент: снимает с сегмента по одному виду форматирования, пока не останется текст
const props = defineProps<{ segment: TextSegment; formats: TextFormat[] }>()

const emit = defineEmits<{ openUser: [payload: { userId: UserId }] }>()

const isRevealed = ref(false)

const current = computed(() => props.formats[0])
const rest = computed(() => props.formats.slice(1))
const href = computed(() => linkHref(props.segment.url ?? props.segment.text))

function openUser() {
  if (props.segment.userId !== undefined) emit('openUser', { userId: props.segment.userId })
}
</script>

<template>
  <blockquote v-if="current === 'quote'" class="chat-text-quote">
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </blockquote>
  <pre
    v-else-if="current === 'codeBlock'"
    class="chat-text-code-block"
    :data-language="segment.language"
  ><code><MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" /></code></pre>
  <span
    v-else-if="current === 'spoiler'"
    class="chat-text-spoiler"
    :class="{ 'chat-text-spoiler--revealed': isRevealed }"
    :role="isRevealed ? undefined : 'button'"
    :tabindex="isRevealed ? undefined : 0"
    :aria-label="isRevealed ? undefined : 'Скрытый текст'"
    @click="isRevealed = true"
    @keydown.enter="isRevealed = true"
    @keydown.space.prevent="isRevealed = true"
  >
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </span>
  <a
    v-else-if="current === 'link' && href"
    class="chat-text-link"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </a>
  <span
    v-else-if="current === 'mention' && segment.userId !== undefined"
    class="chat-text-mention"
    role="button"
    tabindex="0"
    @click="openUser"
    @keydown.enter="openUser"
  >
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </span>
  <code v-else-if="current === 'code'" class="chat-text-code">
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </code>
  <strong v-else-if="current === 'bold'">
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </strong>
  <em v-else-if="current === 'italic'">
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </em>
  <u v-else-if="current === 'underline'">
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </u>
  <s v-else-if="current === 'strikethrough'">
    <MessageTextNode :segment="segment" :formats="rest" @open-user="emit('openUser', $event)" />
  </s>
  <!-- Небезопасная ссылка или упоминание без пользователя: оформление снимается, текст остаётся -->
  <MessageTextNode
    v-else-if="current !== undefined"
    :segment="segment"
    :formats="rest"
    @open-user="emit('openUser', $event)"
  />
  <template v-else>{{ segment.text }}</template>
</template>
