<script setup lang="ts">
import { onBeforeUnmount, onMounted, useId, useTemplateRef, watch } from 'vue'
import BaseIconButton from './BaseIconButton.vue'

const open = defineModel<boolean>({ required: true })

defineProps<{ title: string }>()

const titleId = useId()
const dialog = useTemplateRef('dialog')
let previouslyFocused: HTMLElement | null = null

const focusable =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

function focusDialog() {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value?.focus()
}

function restoreFocus() {
  previouslyFocused?.focus()
  previouslyFocused = null
}

watch(
  open,
  (isOpen) => {
    if (isOpen) focusDialog()
    else restoreFocus()
  },
  { flush: 'post' },
)

onMounted(() => {
  if (open.value) focusDialog()
})

onBeforeUnmount(restoreFocus)

function close() {
  open.value = false
}

function keepFocusInside(event: KeyboardEvent) {
  const root = dialog.value
  if (!root) return
  const items = [...root.querySelectorAll<HTMLElement>(focusable)]
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) {
    event.preventDefault()
    return
  }
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === root)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Transition name="chat-modal">
    <div
      v-if="open"
      class="chat-modal"
      @pointerdown.self="close"
      @keydown.esc.stop="close"
      @keydown.tab="keepFocusInside"
    >
      <div
        ref="dialog"
        class="chat-modal__dialog"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-labelledby="titleId"
      >
        <header class="chat-modal__header">
          <h2 :id="titleId" class="chat-modal__title">{{ title }}</h2>
          <BaseIconButton icon="close" label="Закрыть" :size="36" @click="close" />
        </header>
        <div class="chat-modal__body"><slot /></div>
        <footer v-if="$slots['footer']" class="chat-modal__footer"><slot name="footer" /></footer>
      </div>
    </div>
  </Transition>
</template>

<style>
.chat-modal {
  display: flex;
  position: absolute;
  inset: 0;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background-color: var(--chat-scrim-background);
  padding: 16px;
}

.chat-modal__dialog {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  outline: none;
  box-shadow: 0 8px 32px #00000033;
  border-radius: 15px;
  background-color: var(--chat-surface);
  width: min(480px, 100%);
  max-height: 100%;
  color: var(--chat-text-color);
}

.chat-modal__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 8px 20px;
}

.chat-modal__title {
  flex: 1;
  margin: 0;
  font-weight: 500;
  font-size: 18px;
}

.chat-modal__body {
  padding: 0 20px 20px;
  overflow: auto;
}

.chat-modal__footer {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 20px 20px;
}

.chat-modal-enter-active,
.chat-modal-leave-active {
  transition: opacity 0.15s;
}

.chat-modal-enter-from,
.chat-modal-leave-to {
  opacity: 0;
}
</style>
