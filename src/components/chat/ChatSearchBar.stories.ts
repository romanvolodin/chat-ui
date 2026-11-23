import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { SearchResults } from '../../types'
import ChatSearchBar from './ChatSearchBar.vue'

const meta = {
  title: 'chat/ChatSearchBar',
  component: ChatSearchBar,
  parameters: { layout: 'padded' },
  // Результаты «приходят» через секунду после запроса, как от настоящего движка
  render: (args) => ({
    components: { ChatSearchBar },
    setup() {
      const results = ref<SearchResults | undefined>(args.results)
      const isLoading = ref(false)
      const log = ref<string[]>([])
      const add = (line: string) => {
        log.value = [line, ...log.value].slice(0, 5)
      }
      function onSearch(payload: { query: string }) {
        add(`search «${payload.query}»`)
        isLoading.value = true
        setTimeout(() => {
          results.value = {
            scope: 'chat',
            query: payload.query,
            messageIds: ['m190', 'm175', 'm120'],
          }
          isLoading.value = false
        }, 1000)
      }
      return {
        results,
        isLoading,
        log,
        onSearch,
        onGoToMessage: (payload: { messageId: string }) => {
          add(`goToMessage ${payload.messageId}`)
        },
        onClose: () => {
          add('close')
        },
      }
    },
    template: `
      <div style="width: 520px; max-width: 100%">
        <ChatSearchBar :results="results" :is-loading="isLoading" @search="onSearch" @go-to-message="onGoToMessage" @close="onClose" />
        <p style="margin: 8px 0 0; font: 12px/1.5 ui-monospace, monospace; white-space: pre-line">{{ log.join('\\n') }}</p>
      </div>`,
  }),
} satisfies Meta<typeof ChatSearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Пустой: Story = {}

export const НичегоНеНайдено: Story = {
  args: { results: { scope: 'chat', query: '', messageIds: [] } },
}

export const Загрузка: Story = {
  render: () => ({
    components: { ChatSearchBar },
    template:
      '<div style="width: 520px; max-width: 100%"><ChatSearchBar :is-loading="true" /></div>',
  }),
}
