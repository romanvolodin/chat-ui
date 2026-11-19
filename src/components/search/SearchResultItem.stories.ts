import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SearchResultItem from './SearchResultItem.vue'

const meta = {
  title: 'search/SearchResultItem',
  component: SearchResultItem,
  parameters: { layout: 'padded' },
  args: { title: 'Иван Петров' },
  render: (args) => ({
    components: { SearchResultItem },
    setup: () => ({ args }),
    template: '<div style="width: 360px"><SearchResultItem v-bind="args" /></div>',
  }),
} satisfies Meta<typeof SearchResultItem>

export default meta
type Story = StoryObj<typeof meta>

export const Пользователь: Story = { args: { isOnline: true } }

export const Сообщение: Story = {
  args: {
    title: 'Клуб анонимных собеседников',
    subtitle: 'Анна Смирнова: Завтра сбор в 8:00 на первой точке',
    time: '14:00',
  },
}

export const ДлинныйТекст: Story = {
  args: {
    title: 'Очень длинное название чата, которое не помещается в строку целиком',
    subtitle: 'Очень длинный текст последнего найденного сообщения, который обрежется многоточием',
    time: 'Вчера',
  },
}
