import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { fontFamilies } from '../docs/fonts'
import { sampleMessages } from '../docs/sampleMessages'
import { pinnedChat, sampleChats, sampleNow, sampleTimeZone, sampleUsers } from '../docs/sampleData'
import type {
  ChatEvents,
  ChatId,
  FormattedText,
  Message,
  MessageStatus,
  OpenChat,
  UserMessage,
} from '../types'
import ChatRoot from './ChatRoot.vue'

// Размер контейнера можно менять за правый нижний угол: раскладка следит за шириной блока, а не окна
const frameStyle =
  'width: 900px; max-width: 100%; min-width: 280px; height: 800px; border: 1px solid #ccc; resize: both; overflow: hidden'

// В истории непрочитанными считаются чужие сообщения, начиная с этого
const FIRST_UNREAD_ID = 'm166'

const isIncoming = (message: Message) => message.type === 'user' && message.authorId !== 'me'

function unreadFrom(messages: Message[], index: number) {
  return messages.slice(index).filter(isIncoming)
}

function openChatOf(chatId: ChatId): OpenChat | undefined {
  const chat = sampleChats.find((item) => item.id === chatId)
  if (!chat) return undefined
  const firstUnreadIndex = sampleMessages.findIndex((message) => message.id === FIRST_UNREAD_ID)
  return {
    ...chat,
    footer: chat.type === 'channel' ? { type: 'mute' } : { type: 'input' },
    messages: sampleMessages,
    firstUnreadMessageId: FIRST_UNREAD_ID,
    unreadCount: unreadFrom(sampleMessages, firstUnreadIndex).length,
  }
}

const meta = {
  title: 'ChatRoot',
  component: ChatRoot,
  parameters: { layout: 'padded', standaloneChatRoot: true },
  args: {
    currentUserId: 'me',
    users: sampleUsers,
    chats: sampleChats,
    settings: { now: sampleNow, timeZone: sampleTimeZone },
  },
} satisfies Meta<typeof ChatRoot>

export default meta
type Story = StoryObj<typeof meta>

export const БезОткрытогоЧата: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup: () => ({
      args,
      frameStyle,
      themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
    }),
    template: '<div :style="frameStyle"><ChatRoot v-bind="args" :style="themeStyle" /></div>',
  }),
}

export const ОткрытыйЧат: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup: () => ({
      args,
      frameStyle,
      openChat: openChatOf(pinnedChat.id),
      themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
    }),
    template:
      '<div :style="frameStyle"><ChatRoot v-bind="args" :open-chat="openChat" :style="themeStyle" /></div>',
  }),
}

// Движок в миниатюре: хранит открытые чаты (с черновиками и отправленным), отвечает на события интерфейса
export const СИмитациейДвижка: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup() {
      const openChat = ref<OpenChat | undefined>()
      const opened: Record<ChatId, OpenChat> = {}
      const log = ref<string[]>([
        'Откройте любой чат: лента встанет на метку «Непрочитанные сообщения»',
      ])
      let sentCount = 0

      function addToLog(line: string) {
        log.value = [line, ...log.value].slice(0, 6)
      }

      // Меняет чат в «базе» движка и, если он открыт, то и на экране
      function updateChat(chatId: ChatId, change: (chat: OpenChat) => OpenChat) {
        const current = opened[chatId]
        if (!current) return
        const next = change(current)
        opened[chatId] = next
        if (openChat.value?.id === chatId) openChat.value = next
      }

      function setStatus(chatId: ChatId, messageId: string, status: MessageStatus) {
        updateChat(chatId, (chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.type === 'user' && message.id === messageId ? { ...message, status } : message,
          ),
        }))
      }

      function onSelectChat(payload: { chatId: ChatId }) {
        const chat = opened[payload.chatId] ?? openChatOf(payload.chatId)
        if (!chat) return
        opened[chat.id] = chat
        openChat.value = chat
        addToLog(`selectChat ${chat.id} → непрочитанных: ${String(chat.unreadCount)}`)
      }

      // Помечает прочитанное: следующее непрочитанное это первое чужое сообщение после рубежа
      function onReadUntil(payload: { messageId: string }) {
        const current = openChat.value
        if (!current) return
        const index = current.messages.findIndex((message) => message.id === payload.messageId)
        const unread = unreadFrom(current.messages, index + 1)
        updateChat(current.id, (chat) => ({
          ...chat,
          firstUnreadMessageId: unread[0]?.id,
          unreadCount: unread.length,
        }))
        addToLog(`readUntil ${payload.messageId} → непрочитанных: ${String(unread.length)}`)
      }

      // Сохраняет черновик чата: при возврате в чат текст на месте
      function onChangeDraft(payload: ChatEvents['changeDraft'][0]) {
        const current = openChat.value
        if (!current) return
        const draft: FormattedText | undefined = payload.text.length > 0 ? payload.text : undefined
        updateChat(current.id, (chat) => ({ ...chat, draft }))
      }

      // Принимает сообщение, а статус меняет как настоящий: отправляется, отправлено, прочитано
      function onSendMessage(payload: ChatEvents['sendMessage'][0]) {
        const current = openChat.value
        if (!current) return
        sentCount += 1
        const id = `local-${String(sentCount)}`
        const message: UserMessage = {
          type: 'user',
          id,
          authorId: 'me',
          sentAt: new Date(sampleNow.getTime() + sentCount * 60_000),
          status: 'sending',
          ...(payload.text ? { text: payload.text } : {}),
        }
        updateChat(current.id, (chat) => ({ ...chat, messages: [...chat.messages, message] }))
        addToLog(
          `sendMessage ${id}: «${(payload.text ?? []).map((segment) => segment.text).join('')}»`,
        )
        setTimeout(() => {
          setStatus(current.id, id, 'sent')
        }, 600)
        setTimeout(() => {
          setStatus(current.id, id, 'read')
        }, 1600)
      }

      function onSetChatMuted(payload: { isMuted: boolean }) {
        const current = openChat.value
        if (current) updateChat(current.id, (chat) => ({ ...chat, isMuted: payload.isMuted }))
      }

      // Счётчик открытого чата в списке тоже обновляет движок
      const chats = computed(() =>
        sampleChats.map((chat) =>
          chat.id === openChat.value?.id
            ? { ...chat, unreadCount: openChat.value.unreadCount }
            : chat,
        ),
      )

      return {
        args,
        frameStyle,
        openChat,
        chats,
        log,
        onSelectChat,
        onReadUntil,
        onChangeDraft,
        onSendMessage,
        onSetChatMuted,
        themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
      }
    },
    template: `
      <div>
        <div :style="frameStyle">
          <ChatRoot v-bind="args" :chats="chats" :open-chat="openChat" :style="themeStyle" @select-chat="onSelectChat" @close-chat="openChat = undefined" @set-chat-muted="onSetChatMuted" @read-until="onReadUntil" @change-draft="onChangeDraft" @send-message="onSendMessage" />
        </div>
        <p style="margin: 8px 0 0; font: 12px/1.5 ui-monospace, monospace; white-space: pre-line">Движок:
{{ log.join('\\n') }}</p>
      </div>`,
  }),
}
