import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { FormattedText } from '../../types'
import type { ComposerMode } from './composerMode'
import MessageComposer from './MessageComposer.vue'

const meta = {
  title: 'composer/MessageComposer',
  component: MessageComposer,
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { MessageComposer },
    setup() {
      const log = ref<string[]>([])
      const mode = ref<ComposerMode | undefined>(args.mode)
      const draft = ref<FormattedText | undefined>(args.draft)
      const add = (line: string) => {
        log.value = [line, ...log.value].slice(0, 5)
      }
      return {
        mode,
        draft,
        log,
        onChangeDraft: (payload: { text: FormattedText }) => {
          draft.value = payload.text
        },
        onSend: (payload: unknown) => {
          add(`sendMessage ${JSON.stringify(payload)}`)
        },
        onEdit: (payload: unknown) => {
          add(`editMessage ${JSON.stringify(payload)}`)
        },
      }
    },
    template: `
      <div style="width: 480px; max-width: 100%">
        <div style="padding: 16px; background: var(--chat-background-gradient)">
          <MessageComposer :draft="draft" :mode="mode" @change-draft="onChangeDraft" @send-message="onSend" @edit-message="onEdit" @cancel-mode="mode = undefined" />
        </div>
        <p style="margin: 8px 0 0; font: 12px/1.5 ui-monospace, monospace; white-space: pre-line">{{ log.join('\\n') }}</p>
      </div>`,
  }),
} satisfies Meta<typeof MessageComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Пустое: Story = {}

export const СЧерновиком: Story = {
  args: { draft: [{ text: 'Завтра сбор в 8:00, не опаздываем' }] },
}

export const ОтветНаСообщение: Story = {
  args: {
    mode: {
      kind: 'reply',
      messageId: 'm1',
      authorName: 'Иван Петров',
      text: 'Завтра сбор в 8:00 у главного входа',
    },
  },
}

export const Редактирование: Story = {
  args: {
    draft: [{ text: 'Черновик остаётся на месте' }],
    mode: {
      kind: 'edit',
      messageId: 'm1',
      text: [{ text: 'Завтра сбор в 8:00 у главного входа' }],
    },
  },
}
