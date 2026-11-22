import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseToast from './BaseToast.vue'

const meta = {
  title: 'base/Toast',
  component: BaseToast,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BaseToast>

export default meta
type Story = StoryObj<typeof meta>

export const Короткое: Story = {
  render: () => ({
    components: { BaseToast },
    template: `
      <div style="padding: 24px; background: var(--chat-background-gradient); display: flex; justify-content: center">
        <BaseToast>Ссылка скопирована</BaseToast>
      </div>`,
  }),
}

export const Длинное: Story = {
  render: () => ({
    components: { BaseToast },
    template: `
      <div style="padding: 24px; background: var(--chat-background-gradient); display: flex; justify-content: center">
        <BaseToast>Не удалось отправить сообщение: проверьте соединение и попробуйте ещё раз</BaseToast>
      </div>`,
  }),
}
