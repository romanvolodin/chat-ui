import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseButton from './BaseButton.vue'

const meta = {
  title: 'base/Button',
  component: BaseButton,
  render: (args) => ({
    components: { BaseButton },
    setup: () => ({ args }),
    template: '<BaseButton v-bind="args">Присоединиться</BaseButton>',
  }),
} satisfies Meta<typeof BaseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Обычная: Story = {}

export const Основная: Story = {
  args: { variant: 'primary' },
}

export const Опасная: Story = {
  args: { variant: 'danger' },
  render: (args) => ({
    components: { BaseButton },
    setup: () => ({ args }),
    template: '<BaseButton v-bind="args">Удалить</BaseButton>',
  }),
}

export const Отключённая: Story = {
  args: { variant: 'primary', isDisabled: true },
}
