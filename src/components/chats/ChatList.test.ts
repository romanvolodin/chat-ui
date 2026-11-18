import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { sampleChats } from '../../docs/sampleData'
import { mountWithChatContext } from '../../test-utils/mountWithChatContext'
import type { Chat } from '../../types'
import ChatList from './ChatList.vue'

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void

let notifyVisibility: ObserverCallback
let disconnect: ReturnType<typeof vi.fn>
let mounted: ReturnType<typeof mountWithChatContext> | undefined

beforeEach(() => {
  disconnect = vi.fn()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: ObserverCallback) {
        notifyVisibility = callback
      }
      observe = vi.fn()
      disconnect = disconnect
    },
  )
})

afterEach(() => {
  mounted?.unmount()
  mounted = undefined
  vi.unstubAllGlobals()
})

function mount(props: Record<string, unknown> = {}) {
  mounted = mountWithChatContext(ChatList, { chats: sampleChats, ...props })
  return mounted.container
}

const setBottomVisible = (isIntersecting: boolean) => {
  notifyVisibility([{ isIntersecting }])
}

describe('ChatList', () => {
  it('показывает строку на каждый чат в заданном порядке', () => {
    const titles = [...mount().querySelectorAll('.chat-list-item__title')].map(
      (title) => title.textContent,
    )
    expect(titles).toEqual(sampleChats.map((chat) => chat.title))
  })

  it('не сортирует чаты по закреплению', () => {
    const [first, second] = sampleChats
    if (!first || !second) throw new Error('мало примеров')
    const chats: Chat[] = [
      { ...first, isPinned: false },
      { ...second, isPinned: true },
    ]
    const titles = [...mount({ chats }).querySelectorAll('.chat-list-item__title')].map(
      (title) => title.textContent,
    )
    expect(titles).toEqual([first.title, second.title])
  })

  it('выделяет выбранный чат', () => {
    const selected = sampleChats[1]
    if (!selected) throw new Error('мало примеров')
    const items = [...mount({ selectedChatId: selected.id }).querySelectorAll('.chat-list-item')]
    expect(items.map((item) => item.classList.contains('chat-list-item--selected'))).toEqual(
      sampleChats.map((chat) => chat.id === selected.id),
    )
  })

  it('сообщает id чата при нажатии на строку', async () => {
    const onSelect = vi.fn()
    const target = sampleChats[2]
    if (!target) throw new Error('мало примеров')
    const container = mount({ onSelect })
    container.querySelectorAll<HTMLButtonElement>('.chat-list-item')[2]?.click()
    await nextTick()
    expect(onSelect).toHaveBeenCalledWith(target.id)
  })

  it('показывает индикатор загрузки только пока идёт загрузка', () => {
    expect(mount({ isLoading: true }).querySelector('.chat-spinner')).not.toBeNull()
    mounted?.unmount()
    expect(mount().querySelector('.chat-spinner')).toBeNull()
  })

  it('пустой список без загрузки ничего не рисует кроме контейнера', () => {
    const container = mount({ chats: [] })
    expect(container.querySelectorAll('.chat-list-item')).toHaveLength(0)
    expect(container.querySelector('.chat-list')).not.toBeNull()
  })
})

describe('ChatList: подгрузка', () => {
  it('просит следующую порцию, когда виден низ списка', () => {
    const onReachedBottom = vi.fn()
    mount({ onReachedBottom })
    setBottomVisible(true)
    expect(onReachedBottom).toHaveBeenCalledOnce()
  })

  it('не просит, пока низ не виден', () => {
    const onReachedBottom = vi.fn()
    mount({ onReachedBottom })
    setBottomVisible(false)
    expect(onReachedBottom).not.toHaveBeenCalled()
  })

  it('не просит, пока идёт загрузка', () => {
    const onReachedBottom = vi.fn()
    mount({ onReachedBottom, isLoading: true })
    setBottomVisible(true)
    expect(onReachedBottom).not.toHaveBeenCalled()
  })

  it('просит ещё, если список вырос, а низ всё ещё виден', async () => {
    const onReachedBottom = vi.fn()
    const props = reactive({ chats: sampleChats.slice(0, 3), onReachedBottom })
    mounted = mountWithChatContext(ChatList, props)
    setBottomVisible(true)
    expect(onReachedBottom).toHaveBeenCalledTimes(1)
    props.chats = sampleChats
    await nextTick()
    await nextTick()
    expect(onReachedBottom).toHaveBeenCalledTimes(2)
  })

  it('не просит ещё, если список вырос, но низ уже не виден', async () => {
    const onReachedBottom = vi.fn()
    const props = reactive({ chats: sampleChats.slice(0, 3), onReachedBottom })
    mounted = mountWithChatContext(ChatList, props)
    setBottomVisible(true)
    setBottomVisible(false)
    props.chats = sampleChats
    await nextTick()
    await nextTick()
    expect(onReachedBottom).toHaveBeenCalledTimes(1)
  })

  it('не просит ещё, если список уменьшился', async () => {
    const onReachedBottom = vi.fn()
    const props = reactive({ chats: sampleChats, onReachedBottom })
    mounted = mountWithChatContext(ChatList, props)
    setBottomVisible(true)
    props.chats = sampleChats.slice(0, 2)
    await nextTick()
    await nextTick()
    expect(onReachedBottom).toHaveBeenCalledTimes(1)
  })

  it('не зацикливает запросы, когда загрузка закончилась без новых чатов', async () => {
    const onReachedBottom = vi.fn()
    const props = reactive({ chats: sampleChats, isLoading: false, onReachedBottom })
    mounted = mountWithChatContext(ChatList, props)
    setBottomVisible(true)
    props.isLoading = true
    await nextTick()
    props.isLoading = false
    await nextTick()
    await nextTick()
    expect(onReachedBottom).toHaveBeenCalledTimes(1)
  })

  it('отключает наблюдение при удалении', () => {
    mount()
    mounted?.unmount()
    mounted = undefined
    expect(disconnect).toHaveBeenCalledOnce()
  })
})
