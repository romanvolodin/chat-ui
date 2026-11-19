import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleSearchResults } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import SearchResultsList from './SearchResultsList.vue'

const meta = {
  title: 'search/SearchResultsList',
  component: SearchResultsList,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { results: sampleSearchResults('кни') },
  render: (args) => ({
    components: { SearchResultsList },
    setup: () => ({ args }),
    template:
      '<div style="width: 360px; height: 520px; border: 1px solid #ccc"><SearchResultsList v-bind="args" /></div>',
  }),
} satisfies Meta<typeof SearchResultsList>

export default meta
type Story = StoryObj<typeof meta>

export const Результаты: Story = {}

export const ТолькоСообщения: Story = {
  args: { results: { ...sampleSearchResults('кни'), chats: [], users: [] } },
}

export const НичегоНеНайдено: Story = {
  args: { results: { scope: 'global', query: 'яяя', chats: [], users: [], messages: [] } },
}

export const Загрузка: Story = {
  args: {
    isLoading: true,
    results: { scope: 'global', query: 'кни', chats: [], users: [], messages: [] },
  },
}
