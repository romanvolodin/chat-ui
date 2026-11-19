import { afterEach, describe, expect, it } from 'vitest'
import { groupChat, ownPhotoChat, pinnedChat } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import ChatStatusLine from './ChatStatusLine.vue'

let mounted: ReturnType<typeof mountWithChatContext> | undefined

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
})

function mount(chat: unknown) {
  mounted = mountWithChatContext(ChatStatusLine, { chat })
  return mounted.container.querySelector('.chat-status-line')
}

describe('ChatStatusLine', () => {
  it('онлайн выделяется цветом', () => {
    const line = mount(pinnedChat)
    expect(line?.textContent.trim()).toBe('онлайн')
    expect(line?.classList.contains('chat-status-line--highlighted')).toBe(true)
  })

  it('«был в сети» считается от «сейчас» из настроек', () => {
    const line = mount({ ...ownPhotoChat, peerId: 'maria' })
    expect(line?.textContent.trim()).toBe('был в сети 25 минут назад')
    expect(line?.classList.contains('chat-status-line--highlighted')).toBe(false)
  })

  it('у группы показывает число участников', () => {
    expect(mount({ ...groupChat, memberCount: 8 })?.textContent.trim()).toBe('8 участников')
  })

  it('без статуса ничего не рисует', () => {
    expect(mount(groupChat)).toBeNull()
  })
})
