import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { fontFamilies } from '../docs/fonts'
import { pinnedChat, sampleChats, sampleNow, sampleTimeZone, sampleUsers } from '../docs/sampleData'
import type { ChatId, OpenChat } from '../types'
import ChatRoot from './ChatRoot.vue'

// Размер контейнера можно менять за правый нижний угол: раскладка следит за шириной блока, а не окна
const frameStyle =
  'width: 900px; max-width: 100%; min-width: 280px; height: 800px; border: 1px solid #ccc; resize: both; overflow: hidden'

function openChatOf(chatId: ChatId): OpenChat | undefined {
  const chat = sampleChats.find((item) => item.id === chatId)
  return chat
    ? {
        ...chat,
        footer: chat.type === 'channel' ? { type: 'mute' } : { type: 'input' },
        messages: [],
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
      function onSelectChat(payload: { chatId: ChatId }) {
        openChat.value = openChatOf(payload.chatId)
      }
      function onSetChatMuted(payload: { isMuted: boolean }) {
        if (openChat.value) openChat.value = { ...openChat.value, isMuted: payload.isMuted }
      }
      return {
        args,
        frameStyle,
        openChat,
        onSelectChat,
        onSetChatMuted,
        themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
      }
    },
    template: `
      <div :style="frameStyle">
        <ChatRoot v-bind="args" :open-chat="openChat" :style="themeStyle" @select-chat="onSelectChat" @close-chat="openChat = undefined" @set-chat-muted="onSetChatMuted" />
      </div>`,
  }),
}
