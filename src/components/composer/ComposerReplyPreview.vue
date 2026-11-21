<script setup lang="ts">
import { computed } from 'vue'
import { plainText } from '../../utils/excerpt'
import BaseIcon from '../base/BaseIcon.vue'
import BaseIconButton from '../base/BaseIconButton.vue'
import type { ComposerMode } from './composerMode'

const props = defineProps<{ mode: ComposerMode }>()

const emit = defineEmits<{ cancel: [] }>()

const title = computed(() =>
  props.mode.kind === 'reply' ? `Ответ ${props.mode.authorName}` : 'Редактирование',
)
const text = computed(() =>
  props.mode.kind === 'reply' ? props.mode.text : plainText(props.mode.text),
)
</script>

<template>
  <div class="chat-composer-reply">
    <BaseIcon :name="mode.kind === 'reply' ? 'reply' : 'edit'" :size="24" />
    <div class="chat-composer-reply__body">
      <div class="chat-composer-reply__title">{{ title }}</div>
      <div class="chat-composer-reply__text">{{ text }}</div>
    </div>
    <BaseIconButton
      icon="close"
      :label="mode.kind === 'reply' ? 'Отменить ответ' : 'Отменить редактирование'"
      :size="32"
      @click="emit('cancel')"
    />
  </div>
</template>

<style>
.chat-composer-reply {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 0 14px;
  color: var(--chat-accent-text);
}

.chat-composer-reply__body {
  flex: 1;
  border-left: 2px solid var(--chat-accent);
  padding-left: 8px;
  min-width: 0;
}

.chat-composer-reply__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  font-size: 0.9em;
}

.chat-composer-reply__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--chat-text-muted);
  font-size: 0.9em;
}
</style>
