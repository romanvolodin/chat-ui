import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseSearchInput from './BaseSearchInput.vue'

const meta = {
  title: 'base/SearchInput',
  component: BaseSearchInput,
  args: { modelValue: '' },
  render: (args) => ({
    components: { BaseSearchInput },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div style="width: 320px"><BaseSearchInput v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof BaseSearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Пустое: Story = {}

export const СТекстом: Story = {
  args: { modelValue: 'Василий Иванов' },
}

export const СвояПодсказка: Story = {
  args: { placeholder: 'Поиск по сообщениям' },
}
