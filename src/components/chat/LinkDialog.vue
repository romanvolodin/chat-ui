<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef, watch } from 'vue'
import BaseButton from '../base/BaseButton.vue'
import BaseModal from '../base/BaseModal.vue'

const open = defineModel<boolean>({ required: true })

defineProps<{ url: string }>()

const input = useTemplateRef<HTMLInputElement>('input')

// Адрес сразу выделен: остаётся нажать «копировать». Выделяем после того, как окно забрало фокус себе
function selectUrl() {
  void nextTick(() => {
    input.value?.focus()
    input.value?.select()
  })
}

watch(
  open,
  (isOpen) => {
    if (isOpen) selectUrl()
  },
  { flush: 'post' },
)

onMounted(() => {
  if (open.value) selectUrl()
})
</script>

<template>
  <BaseModal v-model="open" title="Ссылка">
    <p class="chat-link-dialog__text">
      Не удалось скопировать ссылку автоматически. Скопируйте её вручную:
    </p>
    <input
      ref="input"
      class="chat-link-dialog__input"
      type="text"
      readonly
      :value="url"
      aria-label="Ссылка"
    />
    <template #footer>
      <BaseButton variant="primary" @click="open = false">Закрыть</BaseButton>
    </template>
  </BaseModal>
</template>

<style>
.chat-link-dialog__text {
  margin: 0 0 12px;
  color: var(--chat-text-muted);
}

.chat-link-dialog__input {
  display: block;
  box-sizing: border-box;
  border: 1px solid var(--chat-border-color, #0000001f);
  border-radius: 10px;
  background: none;
  padding: 10px 12px;
  width: 100%;
  color: inherit;
  font: inherit;
}

.chat-link-dialog__input:focus-visible {
  outline: 2px solid var(--chat-accent);
}
</style>
