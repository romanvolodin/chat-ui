import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { fontFamilies } from '../docs/fonts'
import { sampleMessages } from '../docs/sampleMessages'
import { pinnedChat, sampleChats, sampleNow, sampleTimeZone, sampleUsers } from '../docs/sampleData'
import type { ChatId, Message, OpenChat } from '../types'
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
  return chat
    ? {
        ...chat,
        footer: chat.type === 'channel' ? { type: 'mute' } : { type: 'input' },
        messages: sampleMessages,
        firstUnreadMessageId: FIRST_UNREAD_ID,
        unreadCount: unreadFrom(
          sampleMessages,
          sampleMessages.findIndex((message) => message.id === FIRST_UNREAD_ID),
        ).length,
      }
    : undefined
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

export const СИмитациейДвижка: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup() {
      const openChat = ref<OpenChat | undefined>()
      const log = ref<string[]>([
        'Откройте любой чат: лента встанет на метку «Непрочитанные сообщения»',
      ])

      function addToLog(line: string) {
        log.value = [line, ...log.value].slice(0, 6)
      }

      function onSelectChat(payload: { chatId: ChatId }) {
        openChat.value = openChatOf(payload.chatId)
        addToLog(
          `selectChat ${payload.chatId} → непрочитанных: ${String(openChat.value?.unreadCount)}`,
        )
      }

      // Движок помечает прочитанное: следующее непрочитанное это первое чужое сообщение после рубежа
      function onReadUntil(payload: { messageId: string }) {
        const current = openChat.value
        if (!current) return
        const index = current.messages.findIndex((message) => message.id === payload.messageId)
        const unread = unreadFrom(current.messages, index + 1)
        openChat.value = {
          ...current,
          firstUnreadMessageId: unread[0]?.id,
          unreadCount: unread.length,
        }
        addToLog(`readUntil ${payload.messageId} → непрочитанных: ${String(unread.length)}`)
      }

      function onSetChatMuted(payload: { isMuted: boolean }) {
        if (openChat.value) openChat.value = { ...openChat.value, isMuted: payload.isMuted }
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
        onSetChatMuted,
        onReadUntil,
        themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
      }
    },
    template: `
      <div>
        <div :style="frameStyle">
          <ChatRoot v-bind="args" :chats="chats" :open-chat="openChat" :style="themeStyle" @select-chat="onSelectChat" @close-chat="openChat = undefined" @set-chat-muted="onSetChatMuted" @read-until="onReadUntil" />
        </div>
        <p style="margin: 8px 0 0; font: 12px/1.5 ui-monospace, monospace; white-space: pre-line">Движок:
{{ log.join('\\n') }}</p>
      </div>`,
  }),
}
