import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MessageStatus from './MessageStatus.vue'

const meta = {
  title: 'message/MessageStatus',
  component: MessageStatus,
  args: { status: 'read' },
} satisfies Meta<typeof MessageStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Прочитано: Story = {}

export const Отправлено: Story = {
  args: { status: 'sent' },
}

export const Отправляется: Story = {
  args: { status: 'sending' },
}

export const Ошибка: Story = {
  args: { status: 'error' },
}

export const Крупный: Story = {
  args: { size: 32 },
}
