import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import LinkDialog from './LinkDialog.vue'

const meta = {
  title: 'chat/LinkDialog',
  component: LinkDialog,
  args: { modelValue: true, url: 'https://example.com/chats/ivan/messages/m170' },
  // Окно ложится на корень чата, поэтому история оборачивает его в `.chat-root`
  render: (args) => ({
    components: { LinkDialog },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="chat-root" style="height: 320px; border: 1px solid #ccc">
        <button type="button" style="margin: 16px" @click="open = true">Показать окно</button>
        <LinkDialog v-bind="args" v-model="open" />
      </div>`,
  }),
} satisfies Meta<typeof LinkDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Адрес: Story = {}

export const ДлинныйАдрес: Story = {
  args: { url: `https://example.com/chats/ivan/messages/m170?${'ref=share&'.repeat(8)}` },
}
