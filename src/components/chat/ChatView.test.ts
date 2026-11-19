import { afterEach, describe, expect, it, vi } from 'vitest'
import { pinnedChat } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { OpenChat } from '../../types'
import ChatView from './ChatView.vue'

const chat: OpenChat = { ...pinnedChat, footer: { type: 'input' }, messages: [] }

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

describe('ChatView', () => {
  it('показывает шапку открытого чата', () => {
    mounted = mountWithChatContext(ChatView, { chat })
    expect(mounted.container.querySelector('.chat-header__title')?.textContent).toBe('Иван Петров')
  })

  it('передаёт наружу закрытие чата из шапки', () => {
    const onCloseChat = vi.fn()
    mounted = mountWithChatContext(ChatView, { chat, onCloseChat })
    mounted.container.querySelector<HTMLElement>('.chat-header__back button')?.click()
    expect(onCloseChat).toHaveBeenCalledOnce()
  })
})
