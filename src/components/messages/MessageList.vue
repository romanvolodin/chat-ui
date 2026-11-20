<script setup lang="ts">
import { computed, onBeforeUpdate, onMounted, onUpdated, ref, useTemplateRef } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import type { ListId, OpenChat, UserId } from '../../types'
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
}>()

const { currentUserId, timeZone } = useChatContext()

/** Насколько близко к низу прокрутка всё ещё считается «внизу», px. */
const BOTTOM_THRESHOLD = 40
/** За сколько px до края просим следующую порцию истории: чтобы она успела прийти до самого края. */
const EDGE_THRESHOLD = 200

const scroller = useTemplateRef<HTMLElement>('scroller')
const isAtBottom = ref(true)

const feed = computed(() =>
  buildFeed(props.chat.messages, {
    currentUserId: currentUserId.value,
    timeZone: timeZone.value,
    firstUnreadMessageId: props.chat.firstUnreadMessageId,
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

function onScroll() {
  updateIsAtBottom()
  requestMoreIfNearEdge()
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
    } else if (isAppended && before.wasAtBottom) {
      scrollToBottom()
    }
    updateIsAtBottom()
  }

  const isNewData = firstId !== renderedFirstId || lastId !== renderedLastId
  before = undefined
  rememberRenderedIds()
  requestMoreIfNearEdge(isNewData)
})
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
