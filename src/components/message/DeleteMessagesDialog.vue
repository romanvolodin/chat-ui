<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { pluralize } from '../../utils/plural'
import BaseButton from '../base/BaseButton.vue'
import BaseModal from '../base/BaseModal.vue'

const open = defineModel<boolean>({ required: true })

const props = withDefaults(
  defineProps<{
    /** Сколько сообщений удаляют. */
    count?: number
    /** Все сообщения можно удалить и у остальных участников, а не только у себя. */
    canDeleteForEveryone?: boolean
  }>(),
  { count: 1, canDeleteForEveryone: false },
)

const emit = defineEmits<{ confirm: [scope: 'self' | 'everyone'] }>()

const forEveryone = ref(false)

// Каждое открытие начинается с безопасного выбора «только у себя»
watch(open, (isOpen) => {
  if (isOpen) forEveryone.value = false
})

const title = computed(() =>
  props.count === 1
    ? 'Удалить сообщение?'
    : `Удалить ${String(props.count)} ${pluralize(props.count, ['сообщение', 'сообщения', 'сообщений'])}?`,
)

function confirm() {
  emit('confirm', props.canDeleteForEveryone && forEveryone.value ? 'everyone' : 'self')
  open.value = false
}
</script>

<template>
  <BaseModal v-model="open" :title="title">
    <p class="chat-delete-dialog__text">Это действие нельзя отменить.</p>
    <label v-if="canDeleteForEveryone" class="chat-delete-dialog__option">
      <input v-model="forEveryone" type="checkbox" />
      <span>Удалить у всех</span>
    </label>
    <template #footer>
      <BaseButton @click="open = false">Отмена</BaseButton>
      <BaseButton variant="danger" @click="confirm">Удалить</BaseButton>
    </template>
  </BaseModal>
</template>

<style>
.chat-delete-dialog__text {
  margin: 0 0 12px;
  color: var(--chat-text-muted);
}

.chat-delete-dialog__option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
</style>
