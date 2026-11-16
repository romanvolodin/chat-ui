import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseBadge from './BaseBadge.vue'

const meta = {
  title: 'base/Badge',
  component: BaseBadge,
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">5</BaseBadge>',
  }),
} satisfies Meta<typeof BaseBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Число: Story = {}

export const Приглушённый: Story = {
  args: { isMuted: true },
}

export const БольшоеЧисло: Story = {
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">12345</BaseBadge>',
  }),
}

export const Упоминание: Story = {
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">@</BaseBadge>',
  }),
}
