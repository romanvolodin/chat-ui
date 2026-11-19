import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { channelChat } from '../../docs/sampleData'
import type { OpenChat } from '../../types'
import ChatFooter from './ChatFooter.vue'

const chatWith = (footer: OpenChat['footer'], extra: Partial<OpenChat> = {}): OpenChat => ({
  ...channelChat,
  footer,
  messages: [],
  ...extra,
})

const meta = {
  title: 'chat/ChatFooter',
  component: ChatFooter,
  parameters: { layout: 'padded' },
  args: { chat: chatWith({ type: 'mute' }, { isMuted: false }) },
  render: (args) => ({
    components: { ChatFooter },
    setup: () => ({ args }),
    template: '<div style="width: 520px; max-width: 100%"><ChatFooter v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ChatFooter>

export default meta
type Story = StoryObj<typeof meta>

export const ОтключитьЗвук: Story = {}

export const ВключитьЗвук: Story = {
  args: { chat: chatWith({ type: 'mute' }, { isMuted: true }) },
}

export const Присоединиться: Story = {
  args: { chat: chatWith({ type: 'join' }) },
}

export const ОткрепитьВсе: Story = {
  args: { chat: chatWith({ type: 'unpinAll' }) },
}

export const ТолькоЧтение: Story = {
  args: { chat: chatWith({ type: 'readOnly' }) },
}

export const ТолькоЧтениеСТекстом: Story = {
  args: { chat: chatWith({ type: 'readOnly', text: 'Писать могут только администраторы' }) },
}
