import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MessageReactions from './MessageReactions.vue'

const meta = {
  title: 'message/MessageReactions',
  component: MessageReactions,
  parameters: { layout: 'padded' },
  args: {
    messageId: 'm1',
    reactions: [
      { icon: { emoji: '👍' }, count: 3, isMine: true },
      { icon: { emoji: '🔥' }, count: 1 },
      { icon: { emoji: '😂' }, count: 12 },
    ],
  },
  render: (args) => ({
    components: { MessageReactions },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; flex-direction: column; box-sizing: border-box; padding: 16px; width: 420px; max-width: 100%; background: var(--chat-background-gradient)">
        <MessageReactions v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof MessageReactions>

export default meta
type Story = StoryObj<typeof meta>

export const Несколько: Story = {}

export const Исходящее: Story = { args: { isOutgoing: true } }

export const ОднаСвоя: Story = {
  args: { reactions: [{ icon: { emoji: '❤️' }, count: 1, isMine: true }] },
}

export const БольшиеЧисла: Story = {
  args: {
    reactions: [
      { icon: { emoji: '👍' }, count: 1234 },
      { icon: { emoji: '🔥' }, count: 25_000, isMine: true },
    ],
  },
}

export const МногоРеакций: Story = {
  args: {
    reactions: ['👍', '🔥', '😂', '😮', '😢', '🎉', '👏', '🤔', '💯', '🙏'].map((emoji, index) => ({
      icon: { emoji },
      count: index + 1,
    })),
  },
}
