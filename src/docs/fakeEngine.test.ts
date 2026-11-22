import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleChats } from './sampleData'
import { useFakeEngine } from './fakeEngine'

const chatId = sampleChats[0]?.id ?? ''
const channelId = sampleChats.find((chat) => chat.type === 'channel')?.id ?? ''

function openedEngine(delay = 0) {
  const engine = useFakeEngine({ delay })
  engine.listeners.selectChat({ chatId })
  return engine
}
const loadedIds = (engine: ReturnType<typeof useFakeEngine>) =>
  (engine.openChat.value?.messages ?? []).map((message) => message.id)

describe('useFakeEngine', () => {
  describe('открытие чата', () => {
    it('без выбора чата ничего не открыто', () => {
      expect(useFakeEngine().openChat.value).toBeUndefined()
    })

    it('открывает чат с последними сообщениями и непрочитанными', () => {
      const chat = openedEngine().openChat.value
      expect(chat?.id).toBe(chatId)
      expect(chat?.messages[0]?.id).toBe('m161')
      expect(chat?.messages.at(-1)?.id).toBe('m200')
      expect(chat?.firstUnreadMessageId).toBe('m166')
      expect(chat?.unreadCount).toBeGreaterThan(0)
    })

    it('у канала вместо поля ввода кнопка звука', () => {
      const engine = useFakeEngine()
      engine.listeners.selectChat({ chatId: channelId })
      expect(engine.openChat.value?.footer).toEqual({ type: 'mute' })
    })

    it('закрытие чата снимает открытый чат', () => {
      const engine = openedEngine()
      engine.listeners.closeChat()
      expect(engine.openChat.value).toBeUndefined()
    })

    it('неизвестный чат не открывает', () => {
      const engine = useFakeEngine()
      engine.listeners.selectChat({ chatId: 'nope' })
      expect(engine.openChat.value).toBeUndefined()
    })
  })

  describe('прочитано до', () => {
    it('сдвигает первое непрочитанное на следующее чужое сообщение и уменьшает счётчик', () => {
      const engine = openedEngine()
      const before = engine.openChat.value?.unreadCount ?? 0
      engine.listeners.readUntil({ messageId: 'm170' })
      const chat = engine.openChat.value
      expect(chat?.unreadCount).toBeLessThan(before)
      expect(Number(chat?.firstUnreadMessageId?.replace('m', ''))).toBeGreaterThan(170)
    })

    it('когда дочитали до конца, непрочитанных нет', () => {
      const engine = openedEngine()
      engine.listeners.readUntil({ messageId: 'm200' })
      expect(engine.openChat.value?.unreadCount).toBe(0)
      expect(engine.openChat.value?.firstUnreadMessageId).toBeUndefined()
    })

    it('счётчик в списке чатов совпадает со счётчиком открытого чата', () => {
      const engine = openedEngine()
      engine.listeners.readUntil({ messageId: 'm180' })
      const inList = engine.chats.value.find((chat) => chat.id === chatId)
      expect(inList?.unreadCount).toBe(engine.openChat.value?.unreadCount)
    })

    it('помнит прочитанное при возврате в чат', () => {
      const engine = openedEngine()
      engine.listeners.readUntil({ messageId: 'm200' })
      engine.listeners.closeChat()
      engine.listeners.selectChat({ chatId })
      expect(engine.openChat.value?.unreadCount).toBe(0)
    })
  })

  describe('подгрузка', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('история сверху приходит порцией после задержки, а пока идёт загрузка, список отмечен', async () => {
      const engine = openedEngine(800)
      engine.listeners.reachedTop()
      expect(engine.loadingLists.value).toEqual(['messages'])
      expect(loadedIds(engine)[0]).toBe('m161')
      await vi.advanceTimersByTimeAsync(800)
      expect(engine.loadingLists.value).toEqual([])
      expect(loadedIds(engine)[0]).toBe('m141')
    })

    it('пока идёт загрузка, новую не начинает', async () => {
      const engine = openedEngine(800)
      engine.listeners.reachedTop()
      engine.listeners.reachedTop()
      await vi.advanceTimersByTimeAsync(800)
      expect(loadedIds(engine)[0]).toBe('m141')
    })

    it('история заканчивается на первом сообщении', () => {
      const engine = openedEngine(0)
      for (let index = 0; index < 20; index++) engine.listeners.reachedTop()
      expect(loadedIds(engine)[0]).toBe('m1')
      expect(engine.openChat.value?.hasMoreBefore).toBe(false)
    })

    it('у верха загруженной части выше есть история', () => {
      expect(openedEngine().openChat.value?.hasMoreBefore).toBe(true)
    })
  })

  describe('переход к далёкому сообщению', () => {
    it('заменяет загруженную часть окном вокруг него', () => {
      const engine = openedEngine()
      engine.listeners.goToMessage({ messageId: 'm120' })
      const ids = loadedIds(engine)
      expect(ids).toContain('m120')
      expect(ids[0]).toBe('m100')
      expect(ids.at(-1)).toBe('m140')
      expect(engine.openChat.value?.hasMoreAfter).toBe(true)
    })

    it('снизу догружает следующую порцию', () => {
      const engine = openedEngine()
      engine.listeners.goToMessage({ messageId: 'm120' })
      engine.listeners.reachedBottom()
      expect(loadedIds(engine).at(-1)).toBe('m160')
    })

    it('«к последним» возвращает последние сообщения', () => {
      const engine = openedEngine()
      engine.listeners.goToMessage({ messageId: 'm120' })
      engine.listeners.goToLatest()
      expect(loadedIds(engine)[0]).toBe('m161')
      expect(engine.openChat.value?.hasMoreAfter).toBe(false)
    })

    it('неверный id игнорирует', () => {
      const engine = openedEngine()
      engine.listeners.goToMessage({ messageId: 'abc' })
      expect(loadedIds(engine)[0]).toBe('m161')
    })
  })

  describe('черновик', () => {
    it('сохраняет черновик и возвращает его при возврате в чат', () => {
      const engine = openedEngine()
      engine.listeners.changeDraft({ text: [{ text: 'Недописанное' }] })
      engine.listeners.closeChat()
      engine.listeners.selectChat({ chatId })
      expect(engine.openChat.value?.draft).toEqual([{ text: 'Недописанное' }])
    })

    it('пустой текст убирает черновик', () => {
      const engine = openedEngine()
      engine.listeners.changeDraft({ text: [{ text: 'а' }] })
      engine.listeners.changeDraft({ text: [] })
      expect(engine.openChat.value?.draft).toBeUndefined()
    })
  })

  describe('отправка', () => {
    it('добавляет своё сообщение в конец', () => {
      const engine = openedEngine()
      engine.listeners.sendMessage({ text: [{ text: 'Привет' }] })
      const last = engine.openChat.value?.messages.at(-1)
      expect(last?.type === 'user' && last.authorId).toBe('me')
      expect(last?.type === 'user' && last.text).toEqual([{ text: 'Привет' }])
    })

    it('статус проходит путь от «отправляется» до «прочитано»', async () => {
      vi.useFakeTimers()
      const engine = openedEngine(800)
      engine.listeners.sendMessage({ text: [{ text: 'Привет' }] })
      const statusOf = () => {
        const last = engine.openChat.value?.messages.at(-1)
        return last?.type === 'user' ? last.status : undefined
      }
      expect(statusOf()).toBe('sending')
      await vi.advanceTimersByTimeAsync(700)
      expect(statusOf()).toBe('sent')
      await vi.advanceTimersByTimeAsync(1000)
      expect(statusOf()).toBe('read')
      vi.useRealTimers()
    })

    it('если читали далёкую часть, возвращает к последним сообщениям', () => {
      const engine = openedEngine()
      engine.listeners.goToMessage({ messageId: 'm120' })
      engine.listeners.sendMessage({ text: [{ text: 'Привет' }] })
      expect(loadedIds(engine)).toContain('m200')
      expect(loadedIds(engine).at(-1)).toBe('local-1')
    })

    it('отправленное остаётся при возврате в чат', () => {
      const engine = openedEngine()
      engine.listeners.sendMessage({ text: [{ text: 'Привет' }] })
      engine.listeners.closeChat()
      engine.listeners.selectChat({ chatId })
      expect(loadedIds(engine).at(-1)).toBe('local-1')
    })
  })

  describe('реакции', () => {
    const reactionsOf = (engine: ReturnType<typeof useFakeEngine>, id: string) => {
      const message = engine.openChat.value?.messages.find((item) => item.id === id)
      return message?.type === 'user' ? message.reactions : undefined
    }

    it('ставит новую реакцию на сообщение без реакций', () => {
      const engine = openedEngine()
      engine.listeners.setReaction({ messageId: 'm170', icon: { emoji: '❤️' }, isSet: true })
      expect(reactionsOf(engine, 'm170')).toEqual([
        { icon: { emoji: '❤️' }, count: 1, isMine: true },
      ])
    })

    it('добавляет голос к чужой реакции', () => {
      const engine = openedEngine()
      // у m162... реакций нет; у m189 (кратно 9) есть 👍 из двух голосов
      engine.listeners.setReaction({ messageId: 'm189', icon: { emoji: '👍' }, isSet: true })
      expect(
        reactionsOf(engine, 'm189')?.find(
          (reaction) => 'emoji' in reaction.icon && reaction.icon.emoji === '👍',
        ),
      ).toMatchObject({
        count: 3,
        isMine: true,
      })
    })

    it('снимает свою реакцию, а когда голосов не осталось, убирает её', () => {
      const engine = openedEngine()
      engine.listeners.setReaction({ messageId: 'm189', icon: { emoji: '🔥' }, isSet: false })
      expect(
        reactionsOf(engine, 'm189')?.some(
          (reaction) => 'emoji' in reaction.icon && reaction.icon.emoji === '🔥',
        ),
      ).toBe(false)
    })

    it('помнит реакции при возврате в чат', () => {
      const engine = openedEngine()
      engine.listeners.setReaction({ messageId: 'm170', icon: { emoji: '❤️' }, isSet: true })
      engine.listeners.closeChat()
      engine.listeners.selectChat({ chatId })
      expect(reactionsOf(engine, 'm170')).toHaveLength(1)
    })
  })

  it('отключение звука сохраняется в чате', () => {
    const engine = useFakeEngine()
    engine.listeners.selectChat({ chatId: channelId })
    engine.listeners.setChatMuted({ chatId: channelId, isMuted: true })
    expect(engine.openChat.value?.isMuted).toBe(true)
  })

  describe('закрепление, правка и удаление', () => {
    const find = (engine: ReturnType<typeof useFakeEngine>, id: string) => {
      const message = engine.openChat.value?.messages.find((item) => item.id === id)
      return message?.type === 'user' ? message : undefined
    }

    it('закрепляет и открепляет сообщение', () => {
      const engine = openedEngine()
      engine.listeners.setMessagePinned({ messageId: 'm170', isPinned: true })
      expect(find(engine, 'm170')?.isPinned).toBe(true)
      engine.listeners.setMessagePinned({ messageId: 'm170', isPinned: false })
      expect(find(engine, 'm170')?.isPinned).toBe(false)
    })

    it('правка меняет текст и помечает сообщение изменённым', () => {
      const engine = openedEngine()
      engine.listeners.editMessage({ messageId: 'm170', text: [{ text: 'Новый текст' }] })
      expect(find(engine, 'm170')?.text).toEqual([{ text: 'Новый текст' }])
      expect(find(engine, 'm170')?.editedAt).toBeInstanceOf(Date)
    })

    it('отправленное сообщение тоже можно изменить', () => {
      const engine = openedEngine()
      engine.listeners.sendMessage({ text: [{ text: 'Привет' }] })
      engine.listeners.editMessage({ messageId: 'local-1', text: [{ text: 'Привет, мир' }] })
      expect(find(engine, 'local-1')?.text).toEqual([{ text: 'Привет, мир' }])
    })

    it('удалённых сообщений в чате больше нет, и после возврата тоже', () => {
      const engine = openedEngine()
      engine.listeners.deleteMessages({ messageIds: ['m170', 'm171'], scope: 'self' })
      expect(loadedIds(engine)).not.toContain('m170')
      expect(loadedIds(engine)).not.toContain('m171')
      engine.listeners.closeChat()
      engine.listeners.selectChat({ chatId })
      expect(loadedIds(engine)).not.toContain('m170')
    })

    it('на запрос ссылки отвечает адресом сообщения', () => {
      const engine = openedEngine()
      engine.listeners.getLink({ messageId: 'm170' })
      expect(engine.requestedLink.value?.url).toBe(
        `https://example.com/chats/${chatId}/messages/m170`,
      )
    })

    it('на запрос ссылки на чат отвечает адресом чата', () => {
      const engine = openedEngine()
      engine.listeners.getLink({ chatId })
      expect(engine.requestedLink.value?.url).toBe(`https://example.com/chats/${chatId}`)
    })

    it('каждый ответ новый объект, даже если адрес тот же', () => {
      const engine = openedEngine()
      engine.listeners.getLink({ messageId: 'm170' })
      const first = engine.requestedLink.value
      engine.listeners.getLink({ messageId: 'm170' })
      expect(engine.requestedLink.value).not.toBe(first)
      expect(engine.requestedLink.value).toEqual(first)
    })
  })
})
