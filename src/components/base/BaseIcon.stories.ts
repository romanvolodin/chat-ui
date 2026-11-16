import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseIcon from './BaseIcon.vue'
import { icons } from './icons'

const meta = {
  title: 'base/Icon',
  component: BaseIcon,
  args: { name: 'search' },
  argTypes: { name: { control: 'select', options: Object.keys(icons) } },
} satisfies Meta<typeof BaseIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Иконка: Story = {}

export const Крупная: Story = {
  args: { size: 64 },
}
