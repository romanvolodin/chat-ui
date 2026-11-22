<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type {
  ChatEvents,
  ChatId,
  FormattedText,
  ListId,
  MessageId,
  OpenChat,
  UserId,
  UserMessage,
} from '../../types'
import { UNKNOWN_USER_NAME, excerptText, plainText } from '../../utils/excerpt'
import type { ComposerMode } from '../composer/composerMode'
import DeleteMessagesDialog from '../message/DeleteMessagesDialog.vue'
import MessageList from '../messages/MessageList.vue'
import ChatFooter from './ChatFooter.vue'
import ChatHeader from './ChatHeader.vue'

withDefaults(
  defineProps<{
    chat: OpenChat
    /** Движок подгружает сообщения этого чата. */
    isLoadingMessages?: boolean
  }>(),
  { isLoadingMessages: false },
)

const emit = defineEmits<{
  closeChat: []
  setChatMuted: [payload: { chatId: ChatId; isMuted: boolean }]
  joinChat: [payload: { chatId: ChatId }]
  unpinAllMessages: [payload: { chatId: ChatId }]
  openUser: [payload: { userId: UserId }]
  goToLatest: []
  reachedTop: [payload: { list: ListId }]
  reachedBottom: [payload: { list: ListId }]
  readUntil: [payload: { messageId: MessageId }]
  goToMessage: [payload: { messageId: MessageId }]
  setReaction: ChatEvents['setReaction']
  changeDraft: ChatEvents['changeDraft']
  sendMessage: ChatEvents['sendMessage']
  editMessage: ChatEvents['editMessage']
  setMessagePinned: ChatEvents['setMessagePinned']
  getLink: ChatEvents['getLink']
  deleteMessages: ChatEvents['deleteMessages']
}>()

const { users, currentUserId } = useChatContext()

// Режим ответа и редактирования хранит сам интерфейс, а в движок уходят только готовые события
const composerMode = ref<ComposerMode>()

function startReply({ message, quote }: { message: UserMessage; quote?: FormattedText }) {
  composerMode.value = {
    kind: 'reply',
    messageId: message.id,
    authorName: users.value[message.authorId]?.name ?? UNKNOWN_USER_NAME,
    text: quote
      ? plainText(quote)
      : excerptText({ text: message.text, contentKind: message.content?.type }),
    ...(quote ? { quote } : {}),
  }
}

function startEdit({ message }: { message: UserMessage }) {
  composerMode.value = { kind: 'edit', messageId: message.id, text: message.text ?? [] }
}

// Окно подтверждения удаления лежит здесь, а не в списке: оно занимает весь чат, а не только ленту
const messageToDelete = ref<UserMessage>()
const isDeleteDialogOpen = computed({
  get: () => messageToDelete.value !== undefined,
  set: (isOpen) => {
    if (!isOpen) messageToDelete.value = undefined
  },
})

function confirmDelete(scope: 'self' | 'everyone') {
  if (messageToDelete.value)
    emit('deleteMessages', { messageIds: [messageToDelete.value.id], scope })
}
</script>

<template>
  <div class="chat-view">
    <ChatHeader :chat="chat" @close-chat="emit('closeChat')" />
    <MessageList
      :chat="chat"
      :is-loading="isLoadingMessages"
      @open-user="emit('openUser', $event)"
      @go-to-latest="emit('goToLatest')"
      @reached-top="emit('reachedTop', $event)"
      @reached-bottom="emit('reachedBottom', $event)"
      @read-until="emit('readUntil', $event)"
      @set-message-pinned="emit('setMessagePinned', $event)"
      @get-link="emit('getLink', $event)"
      @start-reply="startReply"
      @start-edit="startEdit"
      @request-delete="messageToDelete = $event.message"
      @go-to-message="emit('goToMessage', $event)"
      @set-reaction="emit('setReaction', $event)"
    />
    <ChatFooter
      :chat="chat"
      :composer-mode="composerMode"
      @cancel-mode="composerMode = undefined"
      @set-chat-muted="emit('setChatMuted', $event)"
      @join-chat="emit('joinChat', $event)"
      @unpin-all-messages="emit('unpinAllMessages', $event)"
      @change-draft="emit('changeDraft', $event)"
      @send-message="emit('sendMessage', $event)"
      @edit-message="emit('editMessage', $event)"
    />
    <DeleteMessagesDialog
      v-model="isDeleteDialogOpen"
      :can-delete-for-everyone="messageToDelete?.authorId === currentUserId"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style>
.chat-view {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>
