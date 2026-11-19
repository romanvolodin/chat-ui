<script setup lang="ts">
import { watch } from 'vue'
import { useDebouncedFn } from '../../composables/useDebouncedFn'
import BaseSearchInput from '../base/BaseSearchInput.vue'

const SEARCH_DELAY_MS = 300

const query = defineModel<string>({ required: true })

const emit = defineEmits<{ search: [payload: { query: string; scope: 'global' }] }>()

const isBlank = (text: string) => text.trim() === ''

function send(text: string) {
  emit('search', { query: text, scope: 'global' })
}

const debounced = useDebouncedFn(send, SEARCH_DELAY_MS)

watch(query, (text) => {
  if (isBlank(text)) debounced.cancel()
  else debounced.call(text)
})

function submit() {
  if (isBlank(query.value)) return
  debounced.cancel()
  send(query.value)
}
</script>

<template>
  <div class="chat-search">
    <BaseSearchInput v-model="query" @submit="submit" />
  </div>
</template>

<style>
.chat-search {
  background-color: var(--chat-surface);
  padding: 12px;
}
</style>
