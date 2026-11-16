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

export const ВсеИконки: Story = {
  render: () => ({
    components: { BaseIcon },
    setup: () => ({ names: Object.keys(icons) as (keyof typeof icons)[] }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, 110px); gap: 16px">
        <div
          v-for="name in names"
          :key="name"
          style="display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12px"
        >
          <BaseIcon :name="name" :size="32" />
          <span>{{ name }}</span>
        </div>
      </div>
    `,
  }),
}
