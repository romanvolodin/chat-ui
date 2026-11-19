import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleNow } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import type { UserMessage } from '../../types'
import MessageBubble from './MessageBubble.vue'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'ivan',
  sentAt: sampleNow,
  text: [{ text: 'Ага, отлично, спасибо!' }],
}

const meta = {
  title: 'message/MessageBubble',
  component: MessageBubble,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { message },
  // Пузыри выравниваются сами, поэтому им нужен столбец, как в группе сообщений
  render: (args) => ({
    components: { MessageBubble },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--chat-bubble-gap); box-sizing: border-box; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)">
        <MessageBubble v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof MessageBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Входящее: Story = {}

export const Исходящее: Story = {
  args: { isOutgoing: true, message: { ...message, status: 'read' } },
}

export const КороткийТекст: Story = {
  args: { message: { ...message, text: [{ text: 'Ок' }] } },
}

export const ДлинныйТекст: Story = {
  args: {
    message: {
      ...message,
      text: [
        {
          text: 'Иногда для решения задачи достаточно обратиться к документации или посмотреть, как похожая функциональность реализована в других проектах.',
        },
      ],
    },
  },
}

export const ВремяПереносится: Story = {
  args: {
    isOutgoing: true,
    message: {
      ...message,
      text: [{ text: 'Текст почти доходит до края строки, и время не помещается' }],
      status: 'sent',
    },
  },
}

export const СФорматированием: Story = {
  args: {
    message: {
      ...message,
      text: [
        { text: 'Привет, ' },
        { text: '@Анна', format: ['mention'], userId: 'anna' },
        { text: '! Смотри ' },
        { text: 'сайт', format: ['link'], url: 'https://example.com' },
        { text: ' и ' },
        { text: 'важно', format: ['bold', 'underline'] },
        { text: ':\n' },
        { text: 'npm run build', format: ['codeBlock'], language: 'bash' },
      ],
    },
  },
}

export const БезТекста: Story = {
  args: { message: { ...message, text: undefined } },
}

export const СПолнойМетой: Story = {
  args: {
    isOutgoing: true,
    message: {
      ...message,
      status: 'read',
      editedAt: sampleNow,
      isPinned: true,
      viewCount: 1234,
    },
  },
}

export const ОшибкаОтправки: Story = {
  args: { isOutgoing: true, message: { ...message, status: 'error' } },
}

export const ГруппаВходящих: Story = {
  render: () => ({
    components: { MessageBubble },
    setup: () => ({
      first: { ...message, id: 'a', text: [{ text: 'Первое сообщение группы' }] },
      middle: { ...message, id: 'b', text: [{ text: 'Среднее' }] },
      last: { ...message, id: 'c', text: [{ text: 'Последнее, с «хвостиком»' }] },
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--chat-bubble-gap); box-sizing: border-box; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)">
        <MessageBubble :message="first" :is-last-in-group="false" />
        <MessageBubble :message="middle" :is-first-in-group="false" :is-last-in-group="false" />
        <MessageBubble :message="last" :is-first-in-group="false" />
      </div>`,
  }),
}

export const ГруппаИсходящих: Story = {
  render: () => ({
    components: { MessageBubble },
    setup: () => ({
      first: { ...message, id: 'a', status: 'read', text: [{ text: 'Первое сообщение группы' }] },
      middle: { ...message, id: 'b', status: 'read', text: [{ text: 'Среднее' }] },
      last: { ...message, id: 'c', status: 'sent', text: [{ text: 'Последнее, с «хвостиком»' }] },
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--chat-bubble-gap); box-sizing: border-box; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)">
        <MessageBubble :message="first" is-outgoing :is-last-in-group="false" />
        <MessageBubble :message="middle" is-outgoing :is-first-in-group="false" :is-last-in-group="false" />
        <MessageBubble :message="last" is-outgoing :is-first-in-group="false" />
      </div>`,
  }),
}
