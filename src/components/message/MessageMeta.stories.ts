import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleNow } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import MessageMeta from './MessageMeta.vue'

const meta = {
  title: 'message/MessageMeta',
  component: MessageMeta,
  decorators: [withChatContext],
  args: { sentAt: sampleNow },
} satisfies Meta<typeof MessageMeta>

export default meta
type Story = StoryObj<typeof meta>

export const Время: Story = {}

export const Отправляется: Story = { args: { status: 'sending' } }

export const Отправлено: Story = { args: { status: 'sent' } }

export const Прочитано: Story = { args: { status: 'read' } }

export const ОшибкаОтправки: Story = { args: { status: 'error' } }

export const Изменено: Story = { args: { editedAt: sampleNow, status: 'read' } }

export const Закреплено: Story = { args: { isPinned: true } }

export const ПостКанала: Story = { args: { viewCount: 12_500, isPinned: true } }

export const Всё: Story = {
  args: { viewCount: 1234, isPinned: true, editedAt: sampleNow, status: 'read' },
}
