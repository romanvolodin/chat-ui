import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import DeleteMessagesDialog from './DeleteMessagesDialog.vue'

const meta = {
  title: 'message/DeleteMessagesDialog',
  component: DeleteMessagesDialog,
  args: { modelValue: true },
  // Окно ложится на корень чата, поэтому история оборачивает его в `.chat-root`
  render: (args) => ({
    components: { DeleteMessagesDialog },
    setup() {
      const open = ref(true)
      const last = ref('')
      return {
        args,
        open,
        last,
        onConfirm: (scope: string) => {
          last.value = scope
        },
      }
    },
    template: `
      <div class="chat-root" style="height: 320px; border: 1px solid #ccc">
        <button type="button" style="margin: 16px" @click="open = true">Показать окно</button>
        <span>Выбрано: {{ last || '—' }}</span>
        <DeleteMessagesDialog v-bind="args" v-model="open" @confirm="onConfirm" />
      </div>`,
  }),
} satisfies Meta<typeof DeleteMessagesDialog>

export default meta
type Story = StoryObj<typeof meta>

export const ЧужоеСообщение: Story = {}

export const СвоёСообщение: Story = { args: { canDeleteForEveryone: true } }

export const НесколькоСообщений: Story = { args: { count: 3, canDeleteForEveryone: true } }
