import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleNow } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import type { UserMessage } from '../../types'
import MessageItem from './MessageItem.vue'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'ivan',
  sentAt: sampleNow,
  text: [{ text: 'Завтра сбор в 8:00 на первой точке' }],
}

const meta = {
  title: 'message/MessageItem',
  component: MessageItem,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { message },
  render: (args) => ({
    components: { MessageItem },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; flex-direction: column; box-sizing: border-box; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)">
        <MessageItem v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof MessageItem>

export default meta
type Story = StoryObj<typeof meta>

export const Входящее: Story = {}

export const Исходящее: Story = {
  args: { isOutgoing: true, message: { ...message, authorId: 'me', status: 'read' } },
}

export const ОтветНаСообщение: Story = {
  args: {
    message: {
      ...message,
      replyTo: {
        messageId: 'm0',
        excerpt: { authorId: 'anna', text: [{ text: 'Во сколько собираемся?' }] },
      },
    },
  },
}

export const ЗаблокированныйАвтор: Story = {
  args: { message: { ...message, authorId: 'blocked' } },
}
