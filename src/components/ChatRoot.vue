<script setup lang="ts">
import { provideChatContext } from '../composables/chatContext'
import type { ChatEvents, ChatRootProps } from '../types'

const props = defineProps<ChatRootProps>()

defineEmits<ChatEvents>()

provideChatContext(props)
</script>

<template>
  <div class="chat-root"></div>
</template>
