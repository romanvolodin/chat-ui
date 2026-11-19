import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { withChatContext } from '../../docs/withChatContext'
import MessageText from './MessageText.vue'

const meta = {
  title: 'message/MessageText',
  component: MessageText,
  decorators: [withChatContext],
  parameters: { layout: 'padded' },
  args: { text: [{ text: 'Завтра сбор в 8:00 на первой точке' }] },
  render: (args) => ({
    components: { MessageText },
    setup: () => ({ args }),
    template: '<div style="width: 360px; max-width: 100%"><MessageText v-bind="args" /></div>',
  }),
} satisfies Meta<typeof MessageText>

export default meta
type Story = StoryObj<typeof meta>

export const Обычный: Story = {}

export const Перенос: Story = {
  args: { text: [{ text: 'Первая строка\nВторая строка\n\nА это после пустой' }] },
}

export const Оформление: Story = {
  args: {
    text: [
      { text: 'жирный', format: ['bold'] },
      { text: ', ' },
      { text: 'курсив', format: ['italic'] },
      { text: ', ' },
      { text: 'подчёркнутый', format: ['underline'] },
      { text: ', ' },
      { text: 'зачёркнутый', format: ['strikethrough'] },
      { text: ' и ' },
      { text: 'всё сразу', format: ['bold', 'italic', 'underline', 'strikethrough'] },
    ],
  },
}

export const Код: Story = {
  args: {
    text: [
      { text: 'Команда ' },
      { text: 'npm run build', format: ['code'] },
      { text: ' собирает пакет:\n' },
      { text: '.chat-root {\n  width: 100%;\n}', format: ['codeBlock'], language: 'css' },
    ],
  },
}

export const Цитата: Story = {
  args: {
    text: [
      { text: 'Как говорил классик:' },
      { text: 'Не откладывай на завтра то, что можно сделать сегодня', format: ['quote'] },
    ],
  },
}

export const ССылками: Story = {
  args: {
    text: [
      { text: 'Смотри ' },
      { text: 'сайт', format: ['link'], url: 'https://example.com' },
      { text: ' или ' },
      { text: 'example.org', format: ['link'] },
      { text: ', а это ' },
      { text: 'небезопасная', format: ['link'], url: 'javascript:alert(1)' },
    ],
  },
}

export const Упоминание: Story = {
  args: {
    text: [
      { text: 'Привет, ' },
      { text: '@Иван', format: ['mention'], userId: 'ivan' },
      { text: '!' },
    ],
  },
}

export const Спойлер: Story = {
  args: {
    text: [
      { text: 'Убийца — ' },
      { text: 'дворецкий', format: ['spoiler'] },
      { text: ', а мотив — ' },
      { text: 'деньги', format: ['spoiler'] },
    ],
  },
}

export const ДлинноеСлово: Story = {
  args: { text: [{ text: 'Сверхдлинноеслово'.repeat(8) }] },
}
