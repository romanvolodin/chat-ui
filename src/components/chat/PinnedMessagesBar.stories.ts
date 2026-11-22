import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { PinnedMessage } from '../../types'
import PinnedMessagesBar from './PinnedMessagesBar.vue'

const pin = (id: string, text: string): PinnedMessage => ({
  messageId: id,
  excerpt: { authorId: 'ivan', text: [{ text }] },
})

const meta = {
  title: 'chat/PinnedMessagesBar',
  component: PinnedMessagesBar,
  parameters: { layout: 'padded' },
  args: { pinned: [pin('m1', 'Завтра сбор в 8:00 у главного входа')] },
  render: (args) => ({
    components: { PinnedMessagesBar },
    setup() {
      const log = ref<string[]>([])
      const add = (line: string) => {
        log.value = [line, ...log.value].slice(0, 4)
      }
      return {
        args,
        log,
        onGoToMessage: (payload: { messageId: string }) => {
          add(`goToMessage ${payload.messageId}`)
        },
        onOpenPinned: () => {
          add('openPinned')
        },
      }
    },
    template: `
      <div style="width: 480px; max-width: 100%">
        <PinnedMessagesBar v-bind="args" @go-to-message="onGoToMessage" @open-pinned="onOpenPinned" />
        <p style="margin: 8px 0 0; font: 12px/1.5 ui-monospace, monospace; white-space: pre-line">{{ log.join('\\n') }}</p>
      </div>`,
  }),
} satisfies Meta<typeof PinnedMessagesBar>

export default meta
type Story = StoryObj<typeof meta>

export const Одно: Story = {}

export const Несколько: Story = {
  args: {
    pinned: [
      pin('m1', 'Завтра сбор в 8:00 у главного входа'),
      pin('m2', 'Возьмите с собой термосы и бутеры, может быть прохладно'),
      pin('m3', 'Адрес: Центральная, 12, вход слева, от магазина'),
    ],
  },
}

export const Вложение: Story = {
  args: { pinned: [{ messageId: 'm5', excerpt: { authorId: 'anna', contentKind: 'image' } }] },
}

export const ДлинныйТекст: Story = {
  args: {
    pinned: [
      pin(
        'm1',
        'Встреча переносится на среду: в понедельник не все могут, а во вторник кафе занято',
      ),
    ],
  },
}

export const МногоЗакреплённых: Story = {
  args: {
    pinned: Array.from({ length: 8 }, (_, index) =>
      pin(`m${String(index)}`, `Закреплённое сообщение номер ${String(index + 1)}`),
    ),
  },
}
