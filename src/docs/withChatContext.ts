import type { Decorator } from '@storybook/vue3-vite'
import { provideChatContext } from '../composables/chatContext'
import { sampleNow, sampleTimeZone, sampleUsers } from './sampleData'

/** Для историй компонентов, которые берут данные из корня чата. */
export const withChatContext: Decorator = () => ({
  setup() {
    provideChatContext({
      currentUserId: 'me',
      users: sampleUsers,
      chats: [],
      settings: { now: sampleNow, timeZone: sampleTimeZone },
    })
  },
  template: '<story />',
})
