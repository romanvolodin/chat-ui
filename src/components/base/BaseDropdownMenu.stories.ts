import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseDropdownMenu, { type MenuItem } from './BaseDropdownMenu.vue'
import BaseIconButton from './BaseIconButton.vue'

const items: MenuItem[] = [
  { id: 'reply', label: 'Ответить', icon: 'reply' },
  { id: 'forward', label: 'Переслать', icon: 'forward' },
  { id: 'copy', label: 'Копировать текст', icon: 'copy' },
  { id: 'pin', label: 'Закрепить', icon: 'pin' },
  { id: 'edit', label: 'Изменить', icon: 'edit', isDisabled: true },
  { id: 'delete', label: 'Удалить', icon: 'trash', isDanger: true },
]

const meta = {
  title: 'base/DropdownMenu',
  component: BaseDropdownMenu,
  args: { modelValue: false, anchor: null, items },
} satisfies Meta<typeof BaseDropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Выпадающее: Story = {
  render: (args) => ({
    components: { BaseDropdownMenu, BaseIconButton },
    setup() {
      const open = ref(false)
      const anchor = ref<HTMLElement | null>(null)
      const last = ref('')
      function toggle(event: MouseEvent) {
        if (!(event.currentTarget instanceof HTMLElement)) return
        anchor.value = event.currentTarget
        open.value = !open.value
      }
      return { args, open, anchor, last, toggle }
    },
    template: `
      <div class="chat-root" style="height: 360px; border: 1px solid #ccc">
        <div style="display: flex; justify-content: flex-end; padding: 8px">
          <BaseIconButton icon="more-vertical" label="Меню" @click="toggle" />
        </div>
        <p style="margin: 8px 16px">Выбрано: {{ last || '—' }}</p>
        <BaseDropdownMenu v-bind="args" v-model="open" :anchor="anchor" @select="last = $event" />
      </div>
    `,
  }),
}

export const Контекстное: Story = {
  render: (args) => ({
    components: { BaseDropdownMenu },
    setup() {
      const open = ref(false)
      const anchor = ref<{ x: number; y: number } | null>(null)
      const last = ref('')
      function openAt(event: MouseEvent) {
        anchor.value = { x: event.clientX, y: event.clientY }
        open.value = true
      }
      return { args, open, anchor, last, openAt }
    },
    template: `
      <div class="chat-root" style="height: 360px; border: 1px solid #ccc" @contextmenu.prevent="openAt">
        <p style="margin: 16px">Нажмите правой кнопкой мыши в любом месте. Выбрано: {{ last || '—' }}</p>
        <BaseDropdownMenu v-bind="args" v-model="open" :anchor="anchor" @select="last = $event" />
      </div>
    `,
  }),
}
