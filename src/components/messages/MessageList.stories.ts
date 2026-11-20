import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { channelChat, groupChat, pinnedChat } from '../../docs/sampleData'
import { sampleMessages } from '../../docs/sampleMessages'
import { withChatContext } from '../../docs/withChatContext'
import type { OpenChat } from '../../types'
import MessageList from './MessageList.vue'

const privateChat: OpenChat = { ...pinnedChat, footer: { type: 'input' }, messages: sampleMessages }

const meta = {
  title: 'messages/MessageList',
  component: MessageList,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { chat: privateChat },
  render: (args) => ({
    components: { MessageList },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; flex-direction: column; box-sizing: border-box; border: 1px solid #ccc; width: 480px; max-width: 100%; height: 560px; background: var(--chat-background-gradient)">
        <MessageList v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof MessageList>

export default meta
type Story = StoryObj<typeof meta>

export const ЛичныйЧат: Story = {}

export const ГрупповойЧат: Story = {
  args: { chat: { ...groupChat, footer: { type: 'input' }, messages: sampleMessages } },
}

export const СНепрочитанными: Story = {
  args: { chat: { ...privateChat, firstUnreadMessageId: 'm190', unreadCount: 11 } },
}

export const НижеЕстьЕщёСообщения: Story = {
  args: { chat: { ...privateChat, hasMoreAfter: true, unreadCount: 3 } },
}

export const Канал: Story = {
  args: {
    chat: {
      ...channelChat,
      footer: { type: 'mute' },
      messages: sampleMessages.map((message) =>
        message.type === 'user' ? { ...message, authorId: 'ivan', viewCount: 1240 } : message,
      ),
    },
  },
}

export const ПустойЧат: Story = {
  args: { chat: { ...privateChat, messages: [] } },
}
