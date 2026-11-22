import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { sampleNow } from '../../docs/sampleData'
import type { UserMessage } from '../../types'
import type { MessageMenuAction } from '../../utils/messageMenu'
import MessageContextMenu from './MessageContextMenu.vue'

const message: UserMessage = {
  type: 'user',
  id: 'm1',
  authorId: 'ivan',
  sentAt: sampleNow,
  text: [{ text: 'Завтра сбор в 8:00 на первой точке' }],
}

const meta = {
  title: 'message/MessageContextMenu',
  component: MessageContextMenu,
  args: { modelValue: false, anchor: null, message },
  // Меню позиционируется внутри корня чата, поэтому история оборачивает его в `.chat-root`
  render: (args) => ({
    components: { MessageContextMenu },
    setup() {
      const open = ref(false)
      const anchor = ref<{ x: number; y: number } | null>(null)
      const last = ref('')
      function openAt(event: MouseEvent) {
        anchor.value = { x: event.clientX, y: event.clientY }
        open.value = true
      }
      return {
        args,
        open,
        anchor,
        last,
        openAt,
        onAction: (action: MessageMenuAction) => {
          last.value = action
        },
      }
    },
    template: `
      <div class="chat-root" style="height: 360px; border: 1px solid #ccc" @contextmenu.prevent="openAt">
        <p style="margin: 16px">Нажмите правой кнопкой мыши. Выбрано: {{ last || '—' }}</p>
        <MessageContextMenu v-bind="args" v-model="open" :anchor="anchor" @action="onAction" />
      </div>`,
  }),
} satisfies Meta<typeof MessageContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const ЧужоеСообщение: Story = {}

export const СвоёСообщение: Story = { args: { isOutgoing: true } }

export const Закреплённое: Story = { args: { message: { ...message, isPinned: true } } }

export const ОтветНаВыделенное: Story = { args: { hasSelection: true } }

export const ЧатТолькоДляЧтения: Story = { args: { canWrite: false, isOutgoing: true } }
