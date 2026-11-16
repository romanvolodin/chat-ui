import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseSpinner from './BaseSpinner.vue'

const meta = {
  title: 'base/Spinner',
  component: BaseSpinner,
} satisfies Meta<typeof BaseSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Индикатор: Story = {}

export const Крупный: Story = {
  args: { size: 64 },
}

export const Мелкий: Story = {
  args: { size: 16 },
}

export const СвойЦвет: Story = {
  render: (args) => ({
    components: { BaseSpinner },
    setup: () => ({ args }),
    template: '<div style="color: #3da9a7"><BaseSpinner v-bind="args" /></div>',
  }),
}
