import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ScrollDownButton from './ScrollDownButton.vue'

const meta = {
  title: 'messages/ScrollDownButton',
  component: ScrollDownButton,
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { ScrollDownButton },
    setup: () => ({ args }),
    template: `
      <div style="box-sizing: border-box; padding: 24px 24px 24px 80px; background: var(--chat-background-gradient)">
        <ScrollDownButton v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof ScrollDownButton>

export default meta
type Story = StoryObj<typeof meta>

export const Обычная: Story = {}

export const СНепрочитанными: Story = { args: { unreadCount: 7 } }

export const МногоНепрочитанных: Story = { args: { unreadCount: 12_500 } }
