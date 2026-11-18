import { createApp, h, type Component } from 'vue'
import { provideChatContext } from '../composables/chatContext'
import { sampleNow, sampleTimeZone, sampleUsers } from '../docs/sampleData'

/** Монтирует компонент внутри корня чата с примерами пользователей и замороженным временем. */
export function mountWithChatContext(component: Component, props: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp({
    setup() {
      provideChatContext({
        currentUserId: 'me',
        users: sampleUsers,
        chats: [],
        settings: { now: sampleNow, timeZone: sampleTimeZone },
      })
      return () => h(component, props)
    },
  })
  app.mount(container)
  return {
    container,
    unmount: () => {
      app.unmount()
      container.remove()
    },
  }
}
