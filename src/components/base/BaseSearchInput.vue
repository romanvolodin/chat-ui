<script setup lang="ts">
import { useTemplateRef } from 'vue'
import BaseIcon from './BaseIcon.vue'
import BaseIconButton from './BaseIconButton.vue'

const value = defineModel<string>({ required: true })

withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: 'Поиск' })

const emit = defineEmits<{ submit: [] }>()

const input = useTemplateRef('input')

function clear() {
  value.value = ''
  input.value?.focus()
}

function onEnter(event: KeyboardEvent) {
  if (!event.isComposing) emit('submit')
}
</script>

<template>
  <div class="chat-search-input">
    <BaseIcon name="search" :size="24" />
    <input
      ref="input"
      v-model="value"
      class="chat-search-input__field"
      type="search"
      enterkeyhint="search"
      :placeholder="placeholder"
      :aria-label="placeholder"
      @keydown.enter="onEnter"
    />
    <BaseIconButton v-if="value" icon="close" label="Очистить" :size="28" @click="clear" />
  </div>
</template>

<style>
.chat-search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  border-radius: 50vh;
  background-color: var(--chat-search-background);
  padding: 0 10px 0 14px;
  height: 48px;
  color: var(--chat-icon-color);
}

.chat-search-input:focus-within {
  box-shadow: 0 0 0 2px var(--chat-accent);
}

.chat-search-input__field {
  flex: 1;
  outline: none;
  border: none;
  background: none;
  padding: 0;
  min-width: 0;
  color: var(--chat-text-color);
  font: inherit;
  font-size: 17px;
}

.chat-search-input__field::placeholder {
  opacity: 1;
  color: var(--chat-text-placeholder);
}

.chat-search-input__field::-webkit-search-cancel-button {
  appearance: none;
  display: none;
}
</style>
