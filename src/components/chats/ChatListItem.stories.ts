import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  channelChat,
  failedChat,
  groupChat,
  ownPhotoChat,
  pinnedChat,
  sentChat,
  voiceChat,
} from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import ChatListItem from './ChatListItem.vue'

const meta = {
  title: 'chats/ChatListItem',
  component: ChatListItem,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { ChatListItem },
    setup: () => ({ args }),
    template: '<div style="width: 360px"><ChatListItem v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ChatListItem>

export default meta
type Story = StoryObj<typeof meta>

export const ЗакреплённыйСОнлайном: Story = { args: { chat: pinnedChat } }

export const ГруппаСУпоминаниемИСчётчиком: Story = { args: { chat: groupChat } }

export const СвоёФотоПрочитано: Story = { args: { chat: ownPhotoChat } }

export const КаналБезЗвука: Story = { args: { chat: channelChat } }

export const ГолосовоеВчера: Story = { args: { chat: voiceChat } }

export const СвоёОтправлено: Story = { args: { chat: sentChat } }

export const СообщениеСОшибкойПрошлогоГода: Story = { args: { chat: failedChat } }

export const Выбранный: Story = { args: { chat: groupChat, isSelected: true } }

export const ВыбранныйСОнлайном: Story = { args: { chat: pinnedChat, isSelected: true } }
