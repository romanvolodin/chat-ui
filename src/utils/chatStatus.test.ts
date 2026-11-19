import { describe, expect, it } from 'vitest'
import type { Chat, UserDirectory } from '../types'
import { chatStatus } from './chatStatus'

const now = new Date('2026-11-17T12:00:00Z')
const users: UserDirectory = {
  ivan: { id: 'ivan', name: 'Иван', isOnline: true },
  anna: { id: 'anna', name: 'Анна', lastActiveAt: new Date('2026-11-17T11:55:00Z') },
  oleg: { id: 'oleg', name: 'Олег' },
  helper: { id: 'helper', name: 'Помощник', isBot: true, isOnline: true },
}
const status = (chat: Chat) => chatStatus(chat, { users, now, timeZone: 'Europe/Moscow' })
const privateChat = (peerId: string, extra: Partial<Chat> = {}): Chat => ({
  id: peerId,
  type: 'private',
  title: peerId,
  peerId,
  ...extra,
})
const group = (extra: Partial<Chat> = {}): Chat => ({
  id: 'g',
  type: 'group',
  title: 'G',
  ...extra,
})

describe('chatStatus', () => {
  describe('личный чат', () => {
    it('собеседник в сети: «онлайн» с выделением', () => {
      expect(status(privateChat('ivan'))).toEqual({ text: 'онлайн', isHighlighted: true })
    })

    it('собеседник не в сети: «был в сети …»', () => {
      expect(status(privateChat('anna'))).toEqual({
        text: 'был в сети 5 минут назад',
        isHighlighted: false,
      })
    })

    it('нет данных о присутствии: пусто', () => {
      expect(status(privateChat('oleg')).text).toBe('')
    })

    it('собеседника нет в справочнике: пусто', () => {
      expect(status(privateChat('nobody')).text).toBe('')
    })

    it('бот: пометка «Бот», даже если он в сети', () => {
      expect(status(privateChat('helper')).text).toBe('Бот')
    })

    it('печатает: «печатает…» вместо присутствия', () => {
      const chat = privateChat('ivan', { typingUserIds: ['ivan'] })
      expect(status(chat)).toEqual({ text: 'печатает…', isHighlighted: true })
    })
  })

  describe('группа и канал', () => {
    it.each([
      [1, '1 участник'],
      [3, '3 участника'],
      [12, '12 участников'],
    ])('число участников %i: «%s»', (memberCount, expected) => {
      expect(status(group({ memberCount })).text).toBe(expected)
    })

    it('у канала тоже участники', () => {
      expect(status({ id: 'c', type: 'channel', title: 'C', memberCount: 134 }).text).toBe(
        '134 участника',
      )
    })

    it('один печатает: имя и «печатает…»', () => {
      expect(status(group({ memberCount: 5, typingUserIds: ['anna'] })).text).toBe('Анна печатает…')
    })

    it('двое печатают: оба имени', () => {
      expect(status(group({ typingUserIds: ['anna', 'ivan'] })).text).toBe('Анна и Иван печатают…')
    })

    it('трое и больше: число пользователей', () => {
      const typingUserIds = ['anna', 'ivan', 'oleg']
      expect(status(group({ typingUserIds })).text).toBe('3 пользователя печатают…')
    })

    it('неизвестный пользователь печатает: заглушка вместо имени', () => {
      expect(status(group({ typingUserIds: ['nobody'] })).text).toBe(
        'Неизвестный пользователь печатает…',
      )
    })

    it('без числа участников: пусто', () => {
      expect(status(group()).text).toBe('')
    })
  })

  it('подпись из данных чата главнее статусной строки и «печатает…»', () => {
    const chat = privateChat('ivan', { subtitle: 'Сохранённые сообщения', typingUserIds: ['ivan'] })
    expect(status(chat)).toEqual({ text: 'Сохранённые сообщения', isHighlighted: false })
  })
})
