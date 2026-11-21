<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import type { FormattedText, MessageId } from '../../types'
import { isBlank, segmentsToText, trimSegments } from '../../utils/composerText'
import BaseIcon from '../base/BaseIcon.vue'
import type { ComposerMode } from './composerMode'
import ComposerInput from './ComposerInput.vue'
import ComposerReplyPreview from './ComposerReplyPreview.vue'

const props = withDefaults(
  defineProps<{
    /** Сохранённый движком черновик. Интерфейс его сам не хранит, а только показывает и сообщает об изменениях. */
    draft?: FormattedText
    mode?: ComposerMode
  }>(),
  { draft: undefined, mode: undefined },
)

const emit = defineEmits<{
  changeDraft: [payload: { text: FormattedText }]
  sendMessage: [
    payload: { text?: FormattedText; replyTo?: { messageId: MessageId; text?: FormattedText } },
  ]
  editMessage: [payload: { messageId: MessageId; text: FormattedText }]
  /** Закончить ответ или редактирование: нажали крестик, Esc, или сообщение отправлено. */
  cancelMode: []
}>()

const input = useTemplateRef<InstanceType<typeof ComposerInput>>('input')

// Текст обычного режима это черновик. При редактировании в поле другой текст (сообщения), и он в черновик
// не попадает, поэтому после отмены редактирования черновик возвращается на место.
const draftText = ref<FormattedText>(props.draft ?? [])
const editText = ref<FormattedText>(
  props.mode?.kind === 'edit' ? props.mode.text.map((segment) => ({ ...segment })) : [],
)

const isEditing = computed(() => props.mode?.kind === 'edit')

const text = computed<FormattedText>({
  get: () => (isEditing.value ? editText.value : draftText.value),
  set: (next) => {
    if (isEditing.value) {
      editText.value = next
    } else {
      draftText.value = next
      emit('changeDraft', { text: next })
    }
  },
})

const canSend = computed(() => !isBlank(text.value))

// Черновик изменил движок (например, подгрузил сохранённый): показываем его. Эхо наших же правок совпадает с полем и пропускается.
watch(
  () => props.draft,
  (next) => {
    if (segmentsToText(next ?? []) !== segmentsToText(draftText.value)) draftText.value = next ?? []
  },
)

watch(
  () => props.mode,
  (mode) => {
    if (mode?.kind === 'edit') editText.value = mode.text.map((segment) => ({ ...segment }))
    if (mode) void nextTick(() => input.value?.focus())
  },
)

function send() {
  if (!canSend.value) return
  const trimmed = trimSegments(text.value)
  const mode = props.mode

  if (mode?.kind === 'edit') {
    emit('editMessage', { messageId: mode.messageId, text: trimmed })
    emit('cancelMode')
    return
  }

  emit('sendMessage', {
    text: trimmed,
    ...(mode
      ? { replyTo: { messageId: mode.messageId, ...(mode.quote ? { text: mode.quote } : {}) } }
      : {}),
  })
  draftText.value = []
  emit('changeDraft', { text: [] })
  if (mode) emit('cancelMode')
}

function onEscape() {
  if (props.mode) emit('cancelMode')
}
</script>

<template>
  <div class="chat-composer" @keydown.esc="onEscape">
    <ComposerReplyPreview v-if="mode" :mode="mode" @cancel="emit('cancelMode')" />
    <div class="chat-composer__row">
      <ComposerInput ref="input" v-model="text" @submit="send" />
      <button
        class="chat-composer__send"
        type="button"
        :disabled="!canSend"
        :aria-label="isEditing ? 'Сохранить' : 'Отправить'"
        @click="send"
      >
        <BaseIcon :name="isEditing ? 'check' : 'arrow-up'" :size="28" />
      </button>
    </div>
  </div>
</template>

<style>
.chat-composer {
  box-sizing: border-box;
  border-radius: var(--chat-composer-radius);
  background-color: var(--chat-surface);
  overflow: hidden;
  color: var(--chat-text-color);
}

.chat-composer__row {
  display: flex;
  align-items: flex-end;
  padding-left: 16px;
}

.chat-composer__send {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 6px;
  border: none;
  border-radius: 50%;
  background-color: var(--chat-accent);
  padding: 0;
  width: 44px;
  height: 44px;
  color: var(--chat-on-accent);
}

.chat-composer__send:disabled {
  cursor: default;
  background-color: transparent;
  color: var(--chat-icon-color);
}

.chat-composer__send:focus-visible {
  outline: 2px solid var(--chat-accent-text);
  outline-offset: 2px;
}
</style>
