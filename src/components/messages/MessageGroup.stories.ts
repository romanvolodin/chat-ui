import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleNow } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import type { UserMessage } from '../../types'
import MessageGroup from './MessageGroup.vue'

const message = (id: string, text: string, extra: Partial<UserMessage> = {}): UserMessage => ({
  type: 'user',
  id,
  authorId: 'ivan',
  sentAt: sampleNow,
  text: [{ text }],
  ...extra,
})

const messages = [
  message('1', 'Всем привет!'),
  message('2', 'Завтра сбор в 8:00 на Алтайской'),
  message('3', 'Берите термосы и бутеры, одевайтесь теплее, будет прохладно'),
]

const meta = {
  title: 'messages/MessageGroup',
  component: MessageGroup,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { messages },
  render: (args) => ({
    components: { MessageGroup },
    setup: () => ({ args }),
    template: `
      <div style="box-sizing: border-box; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)">
        <MessageGroup v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof MessageGroup>

export default meta
type Story = StoryObj<typeof meta>

export const ЛичныйЧат: Story = {}

export const ВГруппе: Story = { args: { showAuthor: true } }

export const Исходящие: Story = {
  args: {
    isOutgoing: true,
    messages: messages.map((item, index) => ({
      ...item,
      authorId: 'me',
      status: index === messages.length - 1 ? 'sent' : 'read',
    })),
  },
}

export const ОдноСообщениеВГруппе: Story = {
  args: { showAuthor: true, messages: [message('1', 'Одно сообщение')] },
}

export const НеизвестныйАвтор: Story = {
  args: {
    showAuthor: true,
    messages: [message('1', 'Автора нет в справочнике', { authorId: 'nobody' })],
  },
}

export const ДругойАвтор: Story = {
  args: {
    showAuthor: true,
    messages: [message('1', 'Привет от Анны', { authorId: 'anna' })],
  },
}
