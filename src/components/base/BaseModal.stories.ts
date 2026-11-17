import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

const meta = {
  title: 'base/Modal',
  component: BaseModal,
  args: { modelValue: true, title: 'Удалить сообщение' },
  render: (args) => ({
    components: { BaseButton, BaseModal },
    setup: () => ({ args, open: ref(args.modelValue) }),
    template: `
      <div class="chat-root" style="height: 480px; border: 1px solid #ccc">
        <div style="padding: 16px">
          <BaseButton @click="open = true">Открыть окно</BaseButton>
        </div>
        <BaseModal v-bind="args" v-model="open">
          <p style="margin: 0">Сообщение будет удалено у всех участников чата.</p>
          <template #footer>
            <BaseButton @click="open = false">Отмена</BaseButton>
            <BaseButton variant="danger" @click="open = false">Удалить</BaseButton>
          </template>
        </BaseModal>
      </div>
    `,
  }),
} satisfies Meta<typeof BaseModal>

export default meta
type Story = StoryObj<typeof meta>

export const Подтверждение: Story = {}

export const БезПодвала: Story = {
  args: { title: 'Информация о чате' },
  render: (args) => ({
    components: { BaseModal },
    setup: () => ({ args, open: ref(args.modelValue) }),
    template: `
      <div class="chat-root" style="height: 480px; border: 1px solid #ccc">
        <BaseModal v-bind="args" v-model="open">
          <p style="margin: 0">Здесь будет информация о чате.</p>
        </BaseModal>
      </div>
    `,
  }),
}

export const ДлинноеСодержимое: Story = {
  args: { title: 'Участники' },
  render: (args) => ({
    components: { BaseModal },
    setup: () => ({
      args,
      open: ref(args.modelValue),
      names: Array.from({ length: 40 }, (_, index) => `Участник ${String(index + 1)}`),
    }),
    template: `
      <div class="chat-root" style="height: 480px; border: 1px solid #ccc">
        <BaseModal v-bind="args" v-model="open">
          <p v-for="name in names" :key="name" style="margin: 0 0 8px">{{ name }}</p>
        </BaseModal>
      </div>
    `,
  }),
}
