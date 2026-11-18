import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { sampleChats } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import ChatList from './ChatList.vue'

const manyChats = Array.from({ length: 30 }, (_, index) => ({
  ...sampleChats[index % sampleChats.length],
  id: `chat-${String(index)}`,
}))

const meta = {
  title: 'chats/ChatList',
  component: ChatList,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { chats: sampleChats },
  render: (args) => ({
    components: { ChatList },
    setup: () => ({ args }),
    template:
      '<div style="width: 360px; height: 480px; border: 1px solid #ccc"><ChatList v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ChatList>

export default meta
type Story = StoryObj<typeof meta>

export const Список: Story = {}

export const СВыбранным: Story = {
  args: { selectedChatId: 'crew' },
}

export const Загрузка: Story = {
  args: { isLoading: true },
}

export const ДлинныйСПрокруткой: Story = {
  args: { chats: manyChats as typeof sampleChats },
}
