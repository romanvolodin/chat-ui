import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ChatSearch from './ChatSearch.vue'

const meta = {
  title: 'search/ChatSearch',
  component: ChatSearch,
  parameters: { layout: 'padded' },
  args: { modelValue: '' },
} satisfies Meta<typeof ChatSearch>

export default meta
type Story = StoryObj<typeof meta>

export const Поле: Story = {
  render: (args) => ({
    components: { ChatSearch },
    setup() {
      const query = ref(args.modelValue)
      const sent = ref<string[]>([])
      return { query, sent }
    },
    template: `
      <div style="width: 360px">
        <ChatSearch v-model="query" @search="sent.unshift(JSON.stringify($event))" />
        <p style="margin: 8px 12px; font-size: 13px">Отправлено событий: {{ sent.length }}</p>
        <pre style="margin: 0 12px; font-size: 12px">{{ sent.join('\\n') }}</pre>
      </div>
    `,
  }),
}
