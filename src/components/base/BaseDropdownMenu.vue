<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import BaseIcon from './BaseIcon.vue'
import type { IconName } from './icons'
import { placeMenu, type Point } from './menuPosition'

export interface MenuItem {
  id: string
  label: string
  icon?: IconName
  isDanger?: boolean
  isDisabled?: boolean
}

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  anchor: HTMLElement | Point | null
  items: MenuItem[]
}>()

const emit = defineEmits<{ select: [id: string] }>()

const menu = useTemplateRef('menu')
const placement = ref<{ left: number; top: number; maxHeight: number } | null>(null)
let previouslyFocused: HTMLElement | null = null

const style = computed(() =>
  placement.value
    ? {
        left: `${String(placement.value.left)}px`,
        top: `${String(placement.value.top)}px`,
        maxHeight: `${String(placement.value.maxHeight)}px`,
      }
    : { visibility: 'hidden' as const },
)

function close() {
  open.value = false
}

function enabledItems(): HTMLButtonElement[] {
  return [...(menu.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
}

// Меню позиционируется относительно ближайшего родителя с позиционированием, а не относительно экрана
function localOrigin(parent: Element | null): Point {
  if (!parent) return { x: 0, y: 0 }
  const rect = parent.getBoundingClientRect()
  const left: number = rect.left + parent.clientLeft - parent.scrollLeft
  const top: number = rect.top + parent.clientTop - parent.scrollTop
  return { x: left, y: top }
}

function reposition() {
  const element = menu.value
  const anchor = props.anchor
  if (!element || !anchor) return
  const bounds = (element.closest('.chat-root') ?? document.documentElement).getBoundingClientRect()
  const target = anchor instanceof HTMLElement ? anchor.getBoundingClientRect() : anchor
  const size = { width: element.offsetWidth, height: element.offsetHeight }
  const screen = placeMenu(target, size, bounds)
  const origin = localOrigin(element.offsetParent)
  placement.value = {
    left: screen.left - origin.x,
    top: screen.top - origin.y,
    maxHeight: screen.maxHeight,
  }
}

function onPointerDownOutside(event: Event) {
  const target = event.target
  if (!(target instanceof Node) || menu.value?.contains(target)) return
  // Нажатие на сам якорь обрабатывает его владелец: иначе меню закроется и тут же откроется снова
  if (props.anchor instanceof HTMLElement && props.anchor.contains(target)) return
  close()
}

function onOpened() {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.addEventListener('pointerdown', onPointerDownOutside, true)
  window.addEventListener('resize', close)
  reposition()
  void nextTick(() => enabledItems()[0]?.focus())
}

function onClosed() {
  document.removeEventListener('pointerdown', onPointerDownOutside, true)
  window.removeEventListener('resize', close)
  placement.value = null
  previouslyFocused?.focus()
  previouslyFocused = null
}

watch(
  [open, () => props.anchor],
  ([isOpen], [wasOpen]) => {
    if (isOpen && !wasOpen) onOpened()
    else if (isOpen) reposition()
    else if (wasOpen) onClosed()
  },
  { flush: 'post' },
)

onMounted(() => {
  if (open.value) onOpened()
})

onBeforeUnmount(() => {
  if (open.value) onClosed()
})

function choose(item: MenuItem) {
  if (item.isDisabled) return
  emit('select', item.id)
  close()
}

function moveFocus(direction: 1 | -1 | 'first' | 'last') {
  const items = enabledItems()
  if (items.length === 0) return
  const current = items.findIndex((item) => item === document.activeElement)
  let next: number
  if (direction === 'first') next = 0
  else if (direction === 'last') next = items.length - 1
  else next = (current + direction + items.length) % items.length
  items[next]?.focus()
}

function onKeydown(event: KeyboardEvent) {
  const keys: Record<string, () => void> = {
    ArrowDown: () => {
      moveFocus(1)
    },
    ArrowUp: () => {
      moveFocus(-1)
    },
    Home: () => {
      moveFocus('first')
    },
    End: () => {
      moveFocus('last')
    },
    Tab: close,
  }
  const handler = keys[event.key]
  if (!handler) return
  if (event.key !== 'Tab') event.preventDefault()
  handler()
}
</script>

<template>
  <div
    v-if="open"
    ref="menu"
    class="chat-menu"
    role="menu"
    :style="style"
    @keydown.esc.stop="close"
    @keydown="onKeydown"
  >
    <button
      v-for="item in items"
      :key="item.id"
      class="chat-menu__item"
      :class="{ 'chat-menu__item--danger': item.isDanger }"
      type="button"
      role="menuitem"
      :disabled="item.isDisabled"
      @click="choose(item)"
    >
      <BaseIcon v-if="item.icon" :name="item.icon" :size="20" />
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>

<style>
.chat-menu {
  display: flex;
  position: absolute;
  flex-direction: column;
  z-index: 20;
  box-sizing: border-box;
  box-shadow: 0 4px 24px #00000033;
  border-radius: 12px;
  background-color: var(--chat-surface);
  padding: 6px;
  min-width: 200px;
  max-width: 320px;
  overflow-y: auto;
  color: var(--chat-text-color);
}

.chat-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: none;
  padding: 9px 12px;
  width: 100%;
  color: inherit;
  text-align: left;
  font: inherit;
  font-size: 15px;
}

.chat-menu__item:hover:not(:disabled),
.chat-menu__item:focus-visible {
  outline: none;
  background-color: var(--chat-surface-hover);
}

.chat-menu__item:disabled {
  cursor: default;
  opacity: 0.4;
}

.chat-menu__item--danger {
  color: var(--chat-danger);
}
</style>
