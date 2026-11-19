import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { channelChat, groupChat, ownPhotoChat, pinnedChat } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import ChatHeader from './ChatHeader.vue'

const meta = {
  title: 'chat/ChatHeader',
  component: ChatHeader,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { chat: pinnedChat },
  render: (args) => ({
    components: { ChatHeader },
    setup: () => ({ args }),
    template: '<div style="width: 520px; max-width: 100%"><ChatHeader v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ChatHeader>

export default meta
type Story = StoryObj<typeof meta>

export const СобеседникВСети: Story = {}

export const БылВСети: Story = {
  args: { chat: { ...ownPhotoChat, peerId: 'maria', title: 'Мария' } },
}

export const Печатает: Story = {
  args: { chat: { ...pinnedChat, typingUserIds: ['ivan'] } },
}

export const Бот: Story = {
  args: { chat: { ...ownPhotoChat, peerId: 'helper', title: 'Помощник' } },
}

export const Группа: Story = {
  args: { chat: { ...groupChat, memberCount: 8 } },
}

export const ГруппаПечатают: Story = {
  args: { chat: { ...groupChat, memberCount: 8, typingUserIds: ['anna', 'ivan', 'oleg'] } },
}

export const Канал: Story = {
  args: { chat: { ...channelChat, memberCount: 1340 } },
}

export const СПодписьюВместоСтатуса: Story = {
  args: { chat: { ...pinnedChat, title: 'Избранное', subtitle: 'Сохранённые сообщения' } },
}

export const ДлинноеНазвание: Story = {
  args: { chat: { ...groupChat, title: groupChat.title.repeat(3), memberCount: 8 } },
}

export const СКнопкойНазад: Story = {
  render: (args) => ({
    components: { ChatHeader },
    setup: () => ({ args }),
    template:
      '<div style="width: 360px; max-width: 100%; --chat-back-button-display: block"><ChatHeader v-bind="args" /></div>',
  }),
}
