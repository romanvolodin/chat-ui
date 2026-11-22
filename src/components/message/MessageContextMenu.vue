<script setup lang="ts">
import { computed } from 'vue'
import type { UserMessage } from '../../types'
import { messageMenuItems, type MessageMenuAction } from '../../utils/messageMenu'
import BaseDropdownMenu from '../base/BaseDropdownMenu.vue'
import type { Point } from '../base/menuPosition'

const open = defineModel<boolean>({ required: true })

const props = withDefaults(
  defineProps<{
    message?: UserMessage
    anchor: HTMLElement | Point | null
    isOutgoing?: boolean
    canWrite?: boolean
    hasSelection?: boolean
  }>(),
  { message: undefined, isOutgoing: false, canWrite: true, hasSelection: false },
)

const emit = defineEmits<{ action: [action: MessageMenuAction] }>()

const items = computed(() =>
  props.message
    ? messageMenuItems(props.message, {
        isOutgoing: props.isOutgoing,
        canWrite: props.canWrite,
        hasSelection: props.hasSelection,
      })
    : [],
)

function onSelect(id: string) {
  const item = items.value.find((candidate) => candidate.id === id)
  if (item) emit('action', item.id as MessageMenuAction)
}
</script>

<template>
  <BaseDropdownMenu v-model="open" :anchor="anchor" :items="items" @select="onSelect" />
</template>
