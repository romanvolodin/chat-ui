import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { withChatContext } from '../../docs/withChatContext'
import MessageReplyQuote from './MessageReplyQuote.vue'

const meta = {
  title: 'message/MessageReplyQuote',
  component: MessageReplyQuote,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: {
    replyTo: {
      messageId: 'm5',
      excerpt: { authorId: 'ivan', text: [{ text: 'Завтра сбор в 8:00 на первой точке' }] },
    },
  },
  render: (args) => ({
    components: { MessageReplyQuote },
    setup: () => ({ args }),
    template: `
      <div style="box-sizing: border-box; padding: 8px 12px; border-radius: 15px; width: 320px; max-width: 100%; background: var(--chat-bubble-incoming-background)">
        <MessageReplyQuote v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof MessageReplyQuote>

export default meta
type Story = StoryObj<typeof meta>

export const Текст: Story = {}

export const ДлинныйТекст: Story = {
  args: {
    replyTo: {
      messageId: 'm5',
      excerpt: {
        authorId: 'anna',
        text: [
          {
            text: 'Съёмка переносится на среду: в понедельник нет света на площадке, а во вторник занят павильон. Всем быть в 8:00.',
          },
        ],
      },
    },
  },
}

export const Вложение: Story = {
  args: { replyTo: { messageId: 'm6', excerpt: { authorId: 'anna', contentKind: 'image' } } },
}

export const НеизвестныйАвтор: Story = {
  args: {
    replyTo: { messageId: 'm7', excerpt: { authorId: 'nobody', text: [{ text: 'Привет' }] } },
  },
}

export const СистемноеСообщение: Story = {
  args: {
    replyTo: {
      messageId: 's1',
      excerpt: { isSystem: true, text: [{ text: 'Начало обсуждения' }] },
    },
  },
}
