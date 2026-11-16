import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseAvatar from './BaseAvatar.vue'

const picture =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#3da9a7"/>' +
      '<circle cx="50" cy="38" r="18" fill="#fff"/>' +
      '<path d="M16 100a34 34 0 0 1 68 0z" fill="#fff"/>' +
      '</svg>',
  )

const meta = {
  title: 'base/Avatar',
  component: BaseAvatar,
  args: { name: 'Иван Петров' },
} satisfies Meta<typeof BaseAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Картинка: Story = {
  args: { src: picture },
}

export const ИнициалыИмяИФамилия: Story = {}

export const ИнициалыОдноСлово: Story = {
  args: { name: 'Дмитрий' },
}

export const ПустоеИмя: Story = {
  args: { name: '' },
}

export const ВСети: Story = {
  args: { isOnline: true },
}

export const ВСетиСКартинкой: Story = {
  args: { src: picture, isOnline: true },
}

export const Крупный: Story = {
  args: { size: 120, isOnline: true },
}

export const Мелкий: Story = {
  args: { size: 20 },
}

export const ВсеЦвета: Story = {
  render: () => ({
    components: { BaseAvatar },
    setup: () => ({
      names: ['Дмитрий', 'Иван Петров', 'Helper Bot', 'Анна Иванова', 'Елена', 'Олег Менеджер'],
    }),
    template:
      '<div style="display: flex; gap: 10px"><BaseAvatar v-for="name in names" :key="name" :name="name" /></div>',
  }),
}
