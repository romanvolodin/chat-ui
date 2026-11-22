import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useFakeEngine } from '../docs/fakeEngine'
import { fontFamilies } from '../docs/fonts'
import { pinnedChat, sampleChats, sampleNow, sampleTimeZone, sampleUsers } from '../docs/sampleData'
import { sampleMessages } from '../docs/sampleMessages'
import type { OpenChat } from '../types'
import ChatRoot from './ChatRoot.vue'

// Размер контейнера можно менять за правый нижний угол: раскладка следит за шириной блока, а не окна
const frameStyle =
  'width: 900px; max-width: 100%; min-width: 280px; height: 800px; border: 1px solid #ccc; resize: both; overflow: hidden'

const openChat: OpenChat = { ...pinnedChat, footer: { type: 'input' }, messages: sampleMessages }

const meta = {
  title: 'ChatRoot',
  component: ChatRoot,
  parameters: { layout: 'padded', standaloneChatRoot: true },
  args: {
    currentUserId: 'me',
    users: sampleUsers,
    chats: sampleChats,
    settings: { now: sampleNow, timeZone: sampleTimeZone },
  },
} satisfies Meta<typeof ChatRoot>

export default meta
type Story = StoryObj<typeof meta>

export const БезОткрытогоЧата: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup: () => ({
      args,
      frameStyle,
      themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
    }),
    template: '<div :style="frameStyle"><ChatRoot v-bind="args" :style="themeStyle" /></div>',
  }),
}

export const ОткрытыйЧат: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup: () => ({
      args,
      frameStyle,
      openChat,
      themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
    }),
    template:
      '<div :style="frameStyle"><ChatRoot v-bind="args" :open-chat="openChat" :style="themeStyle" /></div>',
  }),
}

// Движок в миниатюре (docs/fakeEngine.ts) отвечает на события интерфейса. Что можно проверить:
// метку «Непрочитанные» и счётчик в списке (листайте вниз), подгрузку истории (листайте вверх),
// переход по цитате к далёкому сообщению (ответ в сообщении m162 ссылается на m120),
// кнопку «вниз», реакции, отправку со сменой статуса, черновики при переключении чатов, контекстное
// меню сообщения (правая кнопка мыши) и «Получить ссылку» (адрес копируется, показывается «Ссылка скопирована»).
// Под шапкой полоса закреплённых: нажатие ведёт сначала к далёкому m120 (через движок), затем к загруженному m184.
export const СИмитациейДвижка: Story = {
  render: (args, { globals }) => ({
    components: { ChatRoot },
    setup() {
      const engine = useFakeEngine()
      return {
        args,
        frameStyle,
        engine,
        themeStyle: { '--chat-font-family': fontFamilies[String(globals.font)] },
      }
    },
    template: `
      <div>
        <div :style="frameStyle">
          <ChatRoot
            v-bind="args"
            :chats="engine.chats.value"
            :open-chat="engine.openChat.value"
            :loading-lists="engine.loadingLists.value"
            :requested-link="engine.requestedLink.value"
            :style="themeStyle"
            v-on="engine.listeners"
          />
        </div>
        <p style="margin: 8px 0 0; font: 12px/1.5 ui-monospace, monospace; white-space: pre-line">Движок:
{{ engine.log.value.join('\\n') }}</p>
      </div>`,
  }),
}
