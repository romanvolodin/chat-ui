import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleNow } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import type { SystemMessage } from '../../types'
import DateDivider from './DateDivider.vue'
import SystemMessageView from './SystemMessage.vue'
import UnreadDivider from './UnreadDivider.vue'

const frame =
  'box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)'

const day = 24 * 60 * 60_000
const dates = [
  sampleNow,
  new Date(sampleNow.getTime() - day),
  new Date('2026-11-05T08:00:00Z'),
  new Date('2025-12-31T08:00:00Z'),
]

const systemMessage = (extra: Partial<SystemMessage> = {}): SystemMessage => ({
  type: 'system',
  id: 's1',
  sentAt: sampleNow,
  text: [{ text: 'Начало обсуждения' }],
  ...extra,
})

const meta = {
  title: 'messages/Dividers',
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ЗаголовкиДней: Story = {
  render: () => ({
    components: { DateDivider },
    setup: () => ({ dates, frame }),
    template:
      '<div :style="frame"><DateDivider v-for="date in dates" :key="date.getTime()" :date="date" /></div>',
  }),
}

export const НепрочитанныеСообщения: Story = {
  render: () => ({
    components: { UnreadDivider },
    setup: () => ({ frame }),
    template: '<div :style="frame"><UnreadDivider /></div>',
  }),
}

export const СистемныеСообщения: Story = {
  render: () => ({
    components: { SystemMessageView },
    setup: () => ({
      frame,
      messages: [
        systemMessage(),
        systemMessage({
          id: 's2',
          authorId: 'ivan',
          text: [{ text: ' переименовал чат в «Ни о чём»' }],
        }),
        systemMessage({
          id: 's3',
          authorId: 'ivan',
          text: [
            { text: ' добавил ' },
            { text: 'Анну Смирнову', format: ['mention'], userId: 'anna' },
          ],
        }),
        systemMessage({
          id: 's4',
          authorId: 'ivan',
          text: [{ text: ' закрепил сообщение «Пожалуйста, ознакомьтесь с правилами чата»' }],
        }),
      ],
    }),
    template:
      '<div :style="frame"><SystemMessageView v-for="m in messages" :key="m.id" :message="m" /></div>',
  }),
}
