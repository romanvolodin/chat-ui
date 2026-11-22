import { computed, ref } from 'vue'
import type {
  ChatEvents,
  ChatId,
  FormattedText,
  ListId,
  Message,
  MessageId,
  MessageStatus,
  OpenChat,
  Reaction,
  ReactionIcon,
  UserMessage,
} from '../types'
import { sampleChats, sampleNow } from './sampleData'
import { createSampleMessages } from './sampleMessages'

// Переписка в примерах: сообщения с номерами от FIRST до LAST, а последние LATEST_FROM..LAST открываются первыми
const FIRST = 1
const LAST = 200
const LATEST_FROM = 161
const PORTION = 20
const FIRST_UNREAD_ID = 'm166'

interface ChatState {
  chat: Omit<OpenChat, 'messages'>
  /** Какой кусок переписки загружен: интерфейс видит только его. */
  from: number
  to: number
  sent: UserMessage[]
  reactions: Record<MessageId, Reaction[]>
  pinned: Record<MessageId, boolean>
  edits: Record<MessageId, FormattedText>
  deleted: Set<MessageId>
}

export interface FakeEngineOptions {
  /** Сколько «грузится» порция сообщений, мс. */
  delay?: number
}

const isIncoming = (message: Message) => message.type === 'user' && message.authorId !== 'me'
const unreadFrom = (messages: Message[], index: number) => messages.slice(index).filter(isIncoming)
const iconKey = (icon: ReactionIcon) => ('emoji' in icon ? icon.emoji : icon.imageUrl)
const numberOf = (id: MessageId) => Number(id.replace(/^m/, ''))

function nextReactions(current: Reaction[], icon: ReactionIcon, isSet: boolean): Reaction[] {
  const key = iconKey(icon)
  const existing = current.find((reaction) => iconKey(reaction.icon) === key)
  if (!existing) return isSet ? [...current, { icon, count: 1, isMine: true }] : current
  const count = existing.count + (isSet ? 1 : -1)
  if (count <= 0) return current.filter((reaction) => reaction !== existing)
  return current.map((reaction) =>
    reaction === existing ? { ...reaction, count, isMine: isSet } : reaction,
  )
}

/**
 * Движок чата в миниатюре для историй: хранит открытые чаты, подгружает переписку порциями и
 * отвечает на события интерфейса так, как отвечал бы настоящий. Данные не сохраняются между запусками.
 */
export function useFakeEngine({ delay = 800 }: FakeEngineOptions = {}) {
  const openChat = ref<OpenChat>()
  const loadingLists = ref<ListId[]>([])
  const log = ref<string[]>([
    'Откройте любой чат: лента встанет на метку «Непрочитанные сообщения»',
  ])
  const states: Record<ChatId, ChatState> = {}
  let sentCount = 0

  function addToLog(line: string) {
    log.value = [line, ...log.value].slice(0, 8)
  }

  function build(state: ChatState): OpenChat {
    const withOverrides = (message: Message): Message => {
      if (message.type !== 'user') return message
      const reactions = state.reactions[message.id]
      const isPinned = state.pinned[message.id]
      const edited = state.edits[message.id]
      return {
        ...message,
        ...(reactions ? { reactions } : {}),
        ...(isPinned === undefined ? {} : { isPinned }),
        ...(edited ? { text: edited, editedAt: new Date(sampleNow.getTime() + 30 * 60_000) } : {}),
      }
    }
    const loaded = createSampleMessages(state.from, state.to)
    const all = state.to === LAST ? [...loaded, ...state.sent] : loaded
    return {
      ...state.chat,
      messages: all.filter((message) => !state.deleted.has(message.id)).map(withOverrides),
      hasMoreBefore: state.from > FIRST,
      hasMoreAfter: state.to < LAST,
    }
  }

  function publish(chatId: ChatId) {
    const state = states[chatId]
    if (state && openChat.value?.id === chatId) openChat.value = build(state)
  }

  function createState(chatId: ChatId): ChatState | undefined {
    const chat = sampleChats.find((item) => item.id === chatId)
    if (!chat) return undefined
    const latest = createSampleMessages(LATEST_FROM, LAST)
    const firstUnreadIndex = latest.findIndex((message) => message.id === FIRST_UNREAD_ID)
    return {
      chat: {
        ...chat,
        footer: chat.type === 'channel' ? { type: 'mute' } : { type: 'input' },
        firstUnreadMessageId: FIRST_UNREAD_ID,
        unreadCount: unreadFrom(latest, firstUnreadIndex).length,
      },
      from: LATEST_FROM,
      to: LAST,
      sent: [],
      reactions: {},
      pinned: {},
      edits: {},
      deleted: new Set(),
    }
  }

  /** Загрузка занимает время: пока она идёт, интерфейс показывает индикатор и новых порций не просит. */
  function load(change: () => void) {
    loadingLists.value = ['messages']
    const finish = () => {
      change()
      loadingLists.value = []
      if (openChat.value) publish(openChat.value.id)
    }
    if (delay > 0) setTimeout(finish, delay)
    else finish()
  }

  const currentState = () => (openChat.value ? states[openChat.value.id] : undefined)

  function setStatus(chatId: ChatId, messageId: MessageId, status: MessageStatus) {
    const state = states[chatId]
    if (!state) return
    state.sent = state.sent.map((message) =>
      message.id === messageId ? { ...message, status } : message,
    )
    publish(chatId)
  }

  const listeners = {
    selectChat({ chatId }: ChatEvents['selectChat'][0]) {
      const state = states[chatId] ?? createState(chatId)
      if (!state) return
      states[chatId] = state
      openChat.value = build(state)
      addToLog(`selectChat ${chatId} → непрочитанных: ${String(state.chat.unreadCount)}`)
    },

    closeChat() {
      openChat.value = undefined
    },

    // Следующее непрочитанное это первое чужое сообщение после рубежа
    readUntil({ messageId }: ChatEvents['readUntil'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      const messages = openChat.value.messages
      const unread = unreadFrom(
        messages,
        messages.findIndex((message) => message.id === messageId) + 1,
      )
      state.chat = {
        ...state.chat,
        firstUnreadMessageId: unread[0]?.id,
        unreadCount: unread.length,
      }
      publish(openChat.value.id)
      addToLog(`readUntil ${messageId} → непрочитанных: ${String(unread.length)}`)
    },

    reachedTop() {
      const state = currentState()
      if (!state || loadingLists.value.length > 0 || state.from <= FIRST) return
      addToLog(`reachedTop → грузим сообщения с m${String(Math.max(FIRST, state.from - PORTION))}`)
      load(() => {
        state.from = Math.max(FIRST, state.from - PORTION)
      })
    },

    reachedBottom() {
      const state = currentState()
      if (!state || loadingLists.value.length > 0 || state.to >= LAST) return
      addToLog(`reachedBottom → грузим сообщения до m${String(Math.min(LAST, state.to + PORTION))}`)
      load(() => {
        state.to = Math.min(LAST, state.to + PORTION)
      })
    },

    // Далёкое сообщение: загруженная часть заменяется окном вокруг него
    goToMessage({ messageId }: ChatEvents['goToMessage'][0]) {
      const state = currentState()
      const target = numberOf(messageId)
      if (!state || !Number.isFinite(target) || loadingLists.value.length > 0) return
      addToLog(`goToMessage ${messageId} → окно вокруг него`)
      load(() => {
        state.from = Math.max(FIRST, target - PORTION)
        state.to = Math.min(LAST, target + PORTION)
      })
    },

    goToLatest() {
      const state = currentState()
      if (!state || loadingLists.value.length > 0) return
      addToLog('goToLatest → последние сообщения')
      load(() => {
        state.from = LATEST_FROM
        state.to = LAST
      })
    },

    // Черновик чата сохраняется: при возврате в чат текст на месте
    changeDraft({ text }: ChatEvents['changeDraft'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      const draft: FormattedText | undefined = text.length > 0 ? text : undefined
      state.chat = { ...state.chat, draft }
      publish(openChat.value.id)
    },

    // Сообщение принимается сразу, а статус меняется как настоящий: отправляется, отправлено, прочитано
    sendMessage({ text }: ChatEvents['sendMessage'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      const chatId = openChat.value.id
      sentCount += 1
      const id = `local-${String(sentCount)}`
      state.from = LATEST_FROM
      state.to = LAST
      state.sent = [
        ...state.sent,
        {
          type: 'user',
          id,
          authorId: 'me',
          sentAt: new Date(sampleNow.getTime() + sentCount * 60_000),
          status: 'sending',
          ...(text ? { text } : {}),
        },
      ]
      publish(chatId)
      addToLog(`sendMessage ${id}: «${(text ?? []).map((segment) => segment.text).join('')}»`)
      if (delay > 0) {
        setTimeout(() => {
          setStatus(chatId, id, 'sent')
        }, delay * 0.75)
        setTimeout(() => {
          setStatus(chatId, id, 'read')
        }, delay * 2)
      } else {
        setStatus(chatId, id, 'read')
      }
    },

    setReaction({ messageId, icon, isSet }: ChatEvents['setReaction'][0]) {
      const state = currentState()
      const message = openChat.value?.messages.find(
        (item): item is UserMessage => item.type === 'user' && item.id === messageId,
      )
      if (!state || !openChat.value || !message) return
      state.reactions[messageId] = nextReactions(message.reactions ?? [], icon, isSet)
      publish(openChat.value.id)
      addToLog(`setReaction ${messageId} ${iconKey(icon)} ${isSet ? 'поставлена' : 'снята'}`)
    },

    setMessagePinned({ messageId, isPinned }: ChatEvents['setMessagePinned'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      state.pinned[messageId] = isPinned
      publish(openChat.value.id)
      addToLog(`setMessagePinned ${messageId} ${isPinned ? 'закреплено' : 'откреплено'}`)
    },

    // Правка текста: сообщение получает пометку «изменено»
    editMessage({ messageId, text }: ChatEvents['editMessage'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      state.edits[messageId] = text
      publish(openChat.value.id)
      addToLog(`editMessage ${messageId}`)
    },

    deleteMessages({ messageIds, scope }: ChatEvents['deleteMessages'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      for (const id of messageIds) state.deleted.add(id)
      publish(openChat.value.id)
      addToLog(
        `deleteMessages ${messageIds.join(', ')} (${scope === 'self' ? 'у себя' : 'у всех'})`,
      )
    },

    // Настоящий движок вернёт адрес в `requestedLink`; здесь только записываем запрос
    getLink(payload: ChatEvents['getLink'][0]) {
      const target = 'messageId' in payload ? payload.messageId : payload.chatId
      addToLog(`getLink ${target} → https://example.com/${openChat.value?.id ?? ''}/${target}`)
    },

    setChatMuted({ isMuted }: ChatEvents['setChatMuted'][0]) {
      const state = currentState()
      if (!state || !openChat.value) return
      state.chat = { ...state.chat, isMuted }
      publish(openChat.value.id)
    },
  }

  // Счётчик непрочитанных открытого чата в списке тоже обновляет движок
  const chats = computed(() =>
    sampleChats.map((chat) =>
      chat.id === openChat.value?.id ? { ...chat, unreadCount: openChat.value.unreadCount } : chat,
    ),
  )

  return { openChat, loadingLists, log, chats, listeners }
}
