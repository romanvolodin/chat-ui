import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseIconButton from './BaseIconButton.vue'

const meta = {
  title: 'base/IconButton',
  component: BaseIconButton,
  args: { icon: 'search', label: 'Поиск' },
} satisfies Meta<typeof BaseIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Кнопка: Story = {}

export const Отключённая: Story = {
  args: { isDisabled: true },
}

export const Крупная: Story = {
  args: { size: 64 },
}

export const Мелкая: Story = {
  args: { size: 28 },
}
