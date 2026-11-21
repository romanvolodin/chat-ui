import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ComposerReplyPreview from './ComposerReplyPreview.vue'

const meta = {
  title: 'composer/ComposerReplyPreview',
  component: ComposerReplyPreview,
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { ComposerReplyPreview },
    setup: () => ({ args }),
    template: `
      <div style="box-sizing: border-box; padding-bottom: 8px; border-radius: 15px; width: 420px; max-width: 100%; background: #fff">
        <ComposerReplyPreview v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof ComposerReplyPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Ответ: Story = {
  args: {
    mode: {
      kind: 'reply',
      messageId: 'm1',
      authorName: 'Иван Петров',
      text: 'Завтра сбор в 8:00 у главного входа',
    },
  },
}

export const ОтветНаВложение: Story = {
  args: { mode: { kind: 'reply', messageId: 'm2', authorName: 'Анна Смирнова', text: 'Фото' } },
}

export const ДлинныйТекст: Story = {
  args: {
    mode: {
      kind: 'reply',
      messageId: 'm3',
      authorName: 'Иван Петров',
      text: 'Встреча переносится на среду: в понедельник не все могут, а во вторник занят зал',
    },
  },
}

export const Редактирование: Story = {
  args: {
    mode: {
      kind: 'edit',
      messageId: 'm1',
      text: [{ text: 'Завтра сбор в 8:00 у главного входа' }],
    },
  },
}
