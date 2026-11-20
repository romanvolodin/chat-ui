import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BasePill from './BasePill.vue'

const frame =
  'box-sizing: border-box; padding: 16px; width: 360px; max-width: 100%; background: var(--chat-background-gradient)'

const meta = {
  title: 'base/Pill',
  component: BasePill,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BasePill>

export default meta
type Story = StoryObj<typeof meta>

export const Короткая: Story = {
  render: () => ({
    components: { BasePill },
    setup: () => ({ frame }),
    template: '<div :style="frame"><BasePill>Сегодня</BasePill></div>',
  }),
}

export const Длинная: Story = {
  render: () => ({
    components: { BasePill },
    setup: () => ({ frame }),
    template:
      '<div :style="frame"><BasePill>Иван Петров переименовал чат в «Встреча в кафе 17 ноября»</BasePill></div>',
  }),
}
