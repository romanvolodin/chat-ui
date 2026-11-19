import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { sampleChats, sampleSearchResults } from '../../docs/sampleData'
import { withChatContext } from '../../docs/withChatContext'
import type { ListId, SearchResults } from '../../types'
import ChatSidebar from './ChatSidebar.vue'

const meta = {
  title: 'chats/ChatSidebar',
  component: ChatSidebar,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { chats: sampleChats },
} satisfies Meta<typeof ChatSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Колонка: Story = {
  render: (args) => ({
    components: { ChatSidebar },
    setup: () => ({ args }),
    template:
      '<div style="width: 360px; height: 560px; border: 1px solid #ccc"><ChatSidebar v-bind="args" /></div>',
  }),
}

export const СИмитациейПоиска: Story = {
  render: (args) => ({
    components: { ChatSidebar },
    setup() {
      const selectedChatId = ref<string | undefined>()
      const searchResults = ref<SearchResults | undefined>()
      const loadingLists = ref<ListId[]>([])
      const events = ref<string[]>([])
      function onSearch(payload: { query: string }) {
        events.value.unshift(`search: ${payload.query}`)
        loadingLists.value = ['searchResults']
        setTimeout(() => {
          searchResults.value = sampleSearchResults(payload.query)
          loadingLists.value = []
        }, 600)
      }
      return { args, selectedChatId, searchResults, loadingLists, events, onSearch }
    },
    template: `
      <div style="display: flex; gap: 24px">
        <div style="width: 360px; height: 560px; border: 1px solid #ccc">
          <ChatSidebar
            v-bind="args"
            :selected-chat-id="selectedChatId"
            :search-results="searchResults"
            :loading-lists="loadingLists"
            @search="onSearch"
            @select-chat="selectedChatId = $event.chatId; events.unshift('selectChat: ' + $event.chatId)"
            @open-user="events.unshift('openUser: ' + $event.userId)"
            @go-to-message="events.unshift('goToMessage: ' + $event.messageId)"
          />
        </div>
        <pre style="font-size: 12px">{{ events.join('\\n') }}</pre>
      </div>
    `,
  }),
}

export const ЗагрузкаСписка: Story = {
  args: { loadingLists: ['chats'] },
  render: (args) => ({
    components: { ChatSidebar },
    setup: () => ({ args }),
    template:
      '<div style="width: 360px; height: 560px; border: 1px solid #ccc"><ChatSidebar v-bind="args" /></div>',
  }),
}
