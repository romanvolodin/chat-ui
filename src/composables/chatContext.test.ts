import { describe, expect, it } from 'vitest'
import { createApp, h, reactive } from 'vue'
import type { ChatRootProps } from '../types'
import { provideChatContext, useChatContext, type ChatContext } from './chatContext'

function baseProps(): ChatRootProps {
  return {
    currentUserId: 'me',
    users: { me: { id: 'me', name: 'Роман' } },
    chats: [],
  }
}

function mountTree(props: ChatRootProps, withProvider = true) {
  let injected: ChatContext | undefined
  const child = () => {
    injected = useChatContext()
    return h('div')
  }
  createApp({
    setup() {
      if (withProvider) provideChatContext(props)
      return () => h(child)
    },
  }).mount(document.createElement('div'))
  if (!injected) throw new Error('контекст не получен')
  return injected
}

describe('контекст чата', () => {
  it('отдаёт потомкам текущего пользователя и справочник', () => {
    const context = mountTree(baseProps())
    expect(context.currentUserId.value).toBe('me')
    expect(context.users.value.me?.name).toBe('Роман')
  })

  it('следит за изменением props', () => {
    const props = reactive(baseProps())
    const context = mountTree(props)
    props.currentUserId = 'other'
    props.users = { other: { id: 'other', name: 'Иван' } }
    expect(context.currentUserId.value).toBe('other')
    expect(context.users.value.other?.name).toBe('Иван')
  })

  it('берёт замороженный момент и часовой пояс из настроек', () => {
    const now = new Date('2026-05-01T09:30:00Z')
    const context = mountTree({
      ...baseProps(),
      settings: { now, timeZone: 'Europe/Moscow' },
    })
    expect(context.now.value).toBe(now)
    expect(context.timeZone.value).toBe('Europe/Moscow')
  })

  it('без настроек идут реальные часы и пояс устройства', () => {
    const context = mountTree(baseProps())
    expect(context.timeZone.value).toBeUndefined()
    expect(Math.abs(context.now.value.getTime() - Date.now())).toBeLessThan(5000)
  })

  it('по умолчанию режим «только чтение» выключен', () => {
    expect(mountTree(baseProps()).isReadOnly.value).toBe(false)
  })

  it('включает режим «только чтение»', () => {
    expect(mountTree({ ...baseProps(), isReadOnly: true }).isReadOnly.value).toBe(true)
  })

  it('вне корня чата сообщает понятную ошибку', () => {
    expect(() => mountTree(baseProps(), false)).toThrow('useChatContext вызван вне ChatRoot')
  })
})
