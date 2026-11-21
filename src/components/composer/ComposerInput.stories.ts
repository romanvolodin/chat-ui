import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { FormattedText } from '../../types'
import ComposerInput from './ComposerInput.vue'

const meta = {
  title: 'composer/ComposerInput',
  component: ComposerInput,
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { ComposerInput },
    setup() {
      const value = ref<FormattedText>(args.modelValue)
      return { args, value }
    },
    template: `
      <div style="box-sizing: border-box; padding: 0 16px; border-radius: 15px; width: 420px; max-width: 100%; background: #fff">
        <ComposerInput v-model="value" :placeholder="args.placeholder" />
      </div>`,
  }),
  args: { modelValue: [] },
} satisfies Meta<typeof ComposerInput>

export default meta
type Story = StoryObj<typeof meta>

export const Пустое: Story = {}

export const СТекстом: Story = {
  args: { modelValue: [{ text: 'Завтра сбор в 8:00 у главного входа' }] },
}

export const ДлинныйТекст: Story = {
  args: {
    modelValue: [
      {
        text: Array.from({ length: 12 }, (_, index) => `Строка ${String(index + 1)}`).join('\n'),
      },
    ],
  },
}

export const СвояПодсказка: Story = { args: { placeholder: 'Комментарий' } }
