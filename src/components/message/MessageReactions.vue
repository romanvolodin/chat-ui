<script setup lang="ts">
import type { MessageId, Reaction, ReactionIcon } from '../../types'
import ReactionChip from './ReactionChip.vue'

defineProps<{
  messageId: MessageId
  reactions: Reaction[]
  isOutgoing?: boolean
}>()

const emit = defineEmits<{
  setReaction: [payload: { messageId: MessageId; icon: ReactionIcon; isSet: boolean }]
}>()

function keyOf(icon: ReactionIcon): string {
  return 'emoji' in icon ? icon.emoji : icon.imageUrl
}
</script>

<template>
  <div
    v-if="reactions.length > 0"
    class="chat-message-reactions"
    :class="{ 'chat-message-reactions--outgoing': isOutgoing }"
  >
    <!-- Нажатие ставит свою реакцию или снимает её; число меняет движок, а не интерфейс -->
    <ReactionChip
      v-for="reaction in reactions"
      :key="keyOf(reaction.icon)"
      :reaction="reaction"
      @click="
        emit('setReaction', { messageId, icon: reaction.icon, isSet: reaction.isMine !== true })
      "
    />
  </div>
</template>

<style>
.chat-message-reactions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 4px;
  max-width: var(--chat-bubble-max-width);
}

.chat-message-reactions--outgoing {
  align-self: flex-end;
  justify-content: flex-end;
}
</style>
