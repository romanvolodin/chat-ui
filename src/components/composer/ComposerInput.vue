<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue'
import type { FormattedText } from '../../types'
import { segmentsToText, textToSegments } from '../../utils/composerText'

const model = defineModel<FormattedText>({ required: true })

withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: 'Сообщение' })

const emit = defineEmits<{ submit: [] }>()

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')

// Пока поле показывает простой текст: оформление из `model` выводится без него и пропадёт при правке
const text = computed(() => segmentsToText(model.value))

function resize() {
  const element = textarea.value
  if (!element) return
  // Сначала сбрасываем высоту, иначе поле не умеет уменьшаться при удалении строк
  element.style.height = 'auto'
  element.style.height = `${String(element.scrollHeight)}px`
}

function onInput(event: Event) {
  if (event.target instanceof HTMLTextAreaElement) {
    model.value = textToSegments(event.target.value)
  }
}

function onEnter(event: KeyboardEvent) {
  // Enter во время набора через IME подтверждает слово, а не отправляет сообщение
  if (event.isComposing || event.shiftKey) return
  event.preventDefault()
  emit('submit')
}

function focus() {
  textarea.value?.focus()
}

onMounted(resize)
watch(text, () => nextTick(resize))

defineExpose({ focus })
</script>

<template>
  <textarea
    ref="textarea"
    class="chat-composer-input"
    rows="1"
    enterkeyhint="send"
    :value="text"
    :placeholder="placeholder"
    :aria-label="placeholder"
    @input="onInput"
    @keydown.enter="onEnter"
  ></textarea>
</template>

<style>
.chat-composer-input {
  display: block;
  flex: 1;
  box-sizing: border-box;
  margin: 0;
  border: none;
  outline: none;
  background: none;
  padding: 14px 0;
  min-width: 0;
  max-height: 250px;
  overflow-y: auto;
  resize: none;
  color: inherit;
  font: inherit;
  line-height: 1.3;
}

.chat-composer-input::placeholder {
  color: var(--chat-text-placeholder);
}
</style>
