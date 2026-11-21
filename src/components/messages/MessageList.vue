<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  ref,
  useTemplateRef,
} from 'vue'
import { useChatContext } from '../../composables/chatContext'
import { provideHighlightedMessageId } from '../../composables/messageHighlight'
import type { ListId, MessageId, OpenChat, UserId } from '../../types'
import { buildFeed } from '../../utils/messageFeed'
import BaseSpinner from '../base/BaseSpinner.vue'
import DateDivider from './DateDivider.vue'
import MessageGroup from './MessageGroup.vue'
import ScrollDownButton from './ScrollDownButton.vue'
import SystemMessage from './SystemMessage.vue'
import UnreadDivider from './UnreadDivider.vue'

const props = withDefaults(
  defineProps<{
    chat: OpenChat
    /** Движок подгружает сообщения: пока так, новых порций не просим, а у края показываем индикатор. */
    isLoading?: boolean
  }>(),
  { isLoading: false },
)

const emit = defineEmits<{
  openUser: [payload: { userId: UserId }]
  goToLatest: []
  reachedTop: [payload: { list: ListId }]
  reachedBottom: [payload: { list: ListId }]
  readUntil: [payload: { messageId: MessageId }]
  goToMessage: [payload: { messageId: MessageId }]
}>()

const { currentUserId, timeZone } = useChatContext()

/** Насколько близко к низу прокрутка всё ещё считается «внизу», px. */
const BOTTOM_THRESHOLD = 40
/** За сколько px до края просим следующую порцию истории: чтобы она успела прийти до самого края. */
const EDGE_THRESHOLD = 200
/** Сколько подсвечиваем сообщение после перехода к нему, мс. */
const HIGHLIGHT_DURATION = 1500
/** Сколько ждём, пока движок подгрузит сообщение, к которому перешли, мс. Позже переход уже не нужен. */
const PENDING_TARGET_TTL = 10_000
/** Как часто сообщаем о прочитанном при прокрутке, мс. */
const READ_CHECK_DELAY = 200
/** Сколько px сообщения должно быть видно, чтобы оно считалось увиденным (если оно не выше этого). */
const SEEN_MIN_VISIBLE = 40

const scroller = useTemplateRef<HTMLElement>('scroller')
const highlightedId = ref<MessageId>()
provideHighlightedMessageId(highlightedId)
const isAtBottom = ref(true)

// Метка «Непрочитанные сообщения» остаётся там, где была при открытии чата. Когда пользователь
// дочитывает, движок убирает или сдвигает `firstUnreadMessageId`, и метка не должна прыгать из-под глаз.
const unreadMessageIdOnOpen = props.chat.firstUnreadMessageId

const feed = computed(() =>
  buildFeed(props.chat.messages, {
    currentUserId: currentUserId.value,
    timeZone: timeZone.value,
    firstUnreadMessageId: unreadMessageIdOnOpen,
  }),
)

// Автора показываем во входящих сообщениях групп; в личном чате и в канале он и так известен
const showAuthors = computed(() => props.chat.type === 'group' || props.chat.type === 'discussion')

const hasNewerMessages = computed(() => props.chat.hasMoreAfter === true)
const isScrollDownVisible = computed(() => !isAtBottom.value || hasNewerMessages.value)

function distanceToBottom(element: HTMLElement): number {
  return element.scrollHeight - element.scrollTop - element.clientHeight
}

function updateIsAtBottom() {
  if (scroller.value) isAtBottom.value = distanceToBottom(scroller.value) <= BOTTOM_THRESHOLD
}

let wasNearTop = false
let wasNearBottom = false

/**
 * Просит у движка следующую порцию, когда прокрутка подошла к краю загруженного. Запрос уходит один раз
 * при подходе к краю, а повторяется, только если пришла порция (`force`), а край всё ещё рядом.
 */
function requestMoreIfNearEdge(force = false) {
  const element = scroller.value
  if (!element) return
  const isNearTop = element.scrollTop <= EDGE_THRESHOLD
  const isNearBottom = distanceToBottom(element) <= EDGE_THRESHOLD

  if (!props.isLoading) {
    if (isNearTop && (force || !wasNearTop) && props.chat.hasMoreBefore) {
      emit('reachedTop', { list: 'messages' })
    }
    if (isNearBottom && (force || !wasNearBottom) && props.chat.hasMoreAfter) {
      emit('reachedBottom', { list: 'messages' })
    }
  }
  wasNearTop = isNearTop
  wasNearBottom = isNearBottom
}

let readCheckTimer: ReturnType<typeof setTimeout> | undefined
let lastReportedId: MessageId | undefined

/** Самое нижнее сообщение, которое пользователь уже видел: всё выше него тоже прочитано. */
function findLastSeenMessageId(): MessageId | undefined {
  const element = scroller.value
  if (!element) return undefined
  const viewportBottom = element.getBoundingClientRect().bottom
  const items = element.querySelectorAll<HTMLElement>('[data-message-id]')
  for (let index = items.length - 1; index >= 0; index--) {
    const item = items[index]
    if (!item) continue
    const rect = item.getBoundingClientRect()
    // Либо сообщение видно целиком (или уже прокручено), либо видна его верхняя часть
    if (rect.bottom <= viewportBottom || rect.top <= viewportBottom - SEEN_MIN_VISIBLE) {
      return item.dataset.messageId
    }
  }
  return undefined
}

/**
 * Сообщает движку «прочитано до X», когда прокрутка дошла до непрочитанных сообщений. Работает только
 * если первое непрочитанное есть среди загруженных сообщений, иначе непонятно, выше оно или ниже.
 * Один и тот же рубеж дважды не отправляется, только движение вперёд.
 */
function reportRead() {
  if (document.visibilityState !== 'visible') return
  const firstUnreadId = props.chat.firstUnreadMessageId
  if (firstUnreadId === undefined) return

  const messages = props.chat.messages
  const firstUnreadIndex = messages.findIndex((message) => message.id === firstUnreadId)
  const seenId = findLastSeenMessageId()
  if (firstUnreadIndex < 0 || seenId === undefined) return

  const seenIndex = messages.findIndex((message) => message.id === seenId)
  const reportedIndex = messages.findIndex((message) => message.id === lastReportedId)
  if (seenIndex < firstUnreadIndex || seenIndex <= reportedIndex) return

  lastReportedId = seenId
  emit('readUntil', { messageId: seenId })
}

// Не чаще раза в READ_CHECK_DELAY: при быстрой прокрутке сообщаем о том, докуда долистали
function scheduleReadCheck() {
  if (readCheckTimer !== undefined) return
  readCheckTimer = setTimeout(() => {
    readCheckTimer = undefined
    reportRead()
  }, READ_CHECK_DELAY)
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') scheduleReadCheck()
}

function onScroll() {
  updateIsAtBottom()
  requestMoreIfNearEdge()
  scheduleReadCheck()
}

function isOwnLastMessage(): boolean {
  const last = props.chat.messages[props.chat.messages.length - 1]
  return last?.type === 'user' && last.authorId === currentUserId.value
}

let highlightTimer: ReturnType<typeof setTimeout> | undefined
let pendingTargetId: MessageId | undefined
let pendingTargetTimer: ReturnType<typeof setTimeout> | undefined

function highlight(messageId: MessageId) {
  clearTimeout(highlightTimer)
  // Сбрасываем и ставим заново, иначе повторный переход к тому же сообщению не перезапустит подсветку
  highlightedId.value = undefined
  void nextTick(() => {
    highlightedId.value = messageId
    highlightTimer = setTimeout(() => {
      highlightedId.value = undefined
    }, HIGHLIGHT_DURATION)
  })
}

/** Прокручивает так, чтобы сообщение оказалось посередине области, и подсвечивает его. */
function revealMessage(messageId: MessageId, behavior: ScrollBehavior) {
  const element = scroller.value
  if (!element) return
  const items = element.querySelectorAll<HTMLElement>('[data-message-id]')
  const target = Array.from(items).find((item) => item.dataset.messageId === messageId)
  if (!target) return
  const targetRect = target.getBoundingClientRect()
  const viewRect = element.getBoundingClientRect()
  const offset = targetRect.top - viewRect.top - (element.clientHeight - targetRect.height) / 2
  element.scrollTo({ top: element.scrollTop + offset, behavior })
  highlight(messageId)
}

function clearPendingTarget() {
  clearTimeout(pendingTargetTimer)
  pendingTargetId = undefined
}

/**
 * Переход к сообщению (из цитаты). Загруженное показываем сами, а для далёкого просим движок
 * заменить загруженную часть окном вокруг него и показываем, когда оно появится.
 */
function goToMessage(messageId: MessageId) {
  if (props.chat.messages.some((message) => message.id === messageId)) {
    clearPendingTarget()
    revealMessage(messageId, 'smooth')
    return
  }
  clearPendingTarget()
  pendingTargetId = messageId
  pendingTargetTimer = setTimeout(clearPendingTarget, PENDING_TARGET_TTL)
  emit('goToMessage', { messageId })
}

function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior })
}

function scrollDown() {
  if (hasNewerMessages.value) emit('goToLatest')
  else scrollToBottom('smooth')
}

function scrollToInitialPosition() {
  const element = scroller.value
  if (!element) return
  const unread = element.querySelector<HTMLElement>('.chat-unread-divider')
  if (unread) {
    // Метка непрочитанных у верхнего края, чтобы выше был виден хвост прочитанного
    const offset = unread.getBoundingClientRect().top - element.getBoundingClientRect().top
    element.scrollTop += offset - 8
  } else {
    scrollToBottom()
  }
  updateIsAtBottom()
}

// Что было до обновления, чтобы после него сохранить положение прокрутки
let before: { height: number; top: number; wasAtBottom: boolean } | undefined
let renderedFirstId: string | undefined
let renderedLastId: string | undefined

function rememberRenderedIds() {
  renderedFirstId = props.chat.messages[0]?.id
  renderedLastId = props.chat.messages[props.chat.messages.length - 1]?.id
}

onMounted(() => {
  rememberRenderedIds()
  scrollToInitialPosition()
  requestMoreIfNearEdge()
  scheduleReadCheck()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  clearTimeout(readCheckTimer)
  clearTimeout(highlightTimer)
  clearTimeout(pendingTargetTimer)
})

onBeforeUpdate(() => {
  const element = scroller.value
  if (!element) return
  before = {
    height: element.scrollHeight,
    top: element.scrollTop,
    wasAtBottom: distanceToBottom(element) <= BOTTOM_THRESHOLD,
  }
})

onUpdated(() => {
  const element = scroller.value
  const firstId = props.chat.messages[0]?.id
  const lastId = props.chat.messages[props.chat.messages.length - 1]?.id

  if (element && before) {
    const isPrepended = firstId !== renderedFirstId && lastId === renderedLastId
    const isAppended = lastId !== renderedLastId && firstId === renderedFirstId
    if (isPrepended) {
      // Историю добавили сверху: сдвигаем прокрутку на высоту добавленного, чтобы текст не «уехал»
      element.scrollTop = before.top + (element.scrollHeight - before.height)
    } else if (isAppended && (before.wasAtBottom || isOwnLastMessage())) {
      // Своё сообщение показываем всегда, даже если читали историю выше
      scrollToBottom()
    }
    updateIsAtBottom()
  }

  const isNewData = firstId !== renderedFirstId || lastId !== renderedLastId
  before = undefined
  rememberRenderedIds()
  requestMoreIfNearEdge(isNewData)
  if (isNewData) scheduleReadCheck()

  if (pendingTargetId !== undefined) {
    const targetId = pendingTargetId
    if (props.chat.messages.some((message) => message.id === targetId)) {
      clearPendingTarget()
      revealMessage(targetId, 'auto')
    }
  }
})

defineExpose({ goToMessage })
</script>

<template>
  <div class="chat-message-list">
    <div ref="scroller" class="chat-message-list__scroller" @scroll.passive="onScroll">
      <div class="chat-message-list__feed">
        <template v-for="item in feed" :key="item.key">
          <DateDivider v-if="item.kind === 'date'" :date="item.date" />
          <UnreadDivider v-else-if="item.kind === 'unread'" />
          <SystemMessage
            v-else-if="item.kind === 'system'"
            :message="item.message"
            @open-user="emit('openUser', $event)"
          />
          <MessageGroup
            v-else
            :messages="item.messages"
            :is-outgoing="item.isOutgoing"
            :show-author="showAuthors && !item.isOutgoing"
            @open-user="emit('openUser', $event)"
            @go-to-message="goToMessage($event.messageId)"
          />
        </template>
      </div>
    </div>
    <!-- Индикаторы поверх списка, а не в нём: появившись, они не сдвинут сообщения -->
    <div
      v-if="isLoading && chat.hasMoreBefore"
      class="chat-message-list__loading chat-message-list__loading--top"
    >
      <BaseSpinner />
    </div>
    <div
      v-if="isLoading && chat.hasMoreAfter"
      class="chat-message-list__loading chat-message-list__loading--bottom"
    >
      <BaseSpinner />
    </div>
    <ScrollDownButton
      v-if="isScrollDownVisible"
      class="chat-message-list__down"
      :unread-count="chat.unreadCount"
      @click="scrollDown"
    />
  </div>
</template>

<style>
.chat-message-list {
  position: relative;
  flex: 1;
  min-height: 0;
}

.chat-message-list__scroller {
  /* Положение при догрузке истории выравниваем сами, встроенное выравнивание браузера мешало бы */
  overflow-anchor: none;
  height: 100%;
  overflow-y: auto;
}

.chat-message-list__feed {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto;
  padding: 10px;
  max-width: var(--chat-dialog-max-width);
}

.chat-message-list__loading {
  display: flex;
  position: absolute;
  left: 0;
  justify-content: center;
  pointer-events: none;
  width: 100%;
  color: var(--chat-text-muted);
}

.chat-message-list__loading--top {
  top: 8px;
}

.chat-message-list__loading--bottom {
  bottom: 8px;
}

.chat-message-list__down {
  position: absolute;
  right: 16px;
  bottom: 16px;
}
</style>
