import type { Decorator, Preview } from '@storybook/vue3-vite'
import '../src/index'
import { fontFamilies, fontToolbarItems } from '../src/docs/fonts'

// Истории с standaloneChatRoot содержат свой ChatRoot, поэтому декоратор
// не оборачивает их в .chat-root: иначе внутренний корень перекроет шрифт,
// выбранный в тулбаре
const withChatRoot: Decorator = (_story, context) =>
  context.parameters['standaloneChatRoot']
    ? { template: '<story />' }
    : {
        setup: () => ({ fontFamily: fontFamilies[String(context.globals['font'])] }),
        template:
          '<div class="chat-theme" :style="{ \'--chat-font-family\': fontFamily }"><story /></div>',
      }

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withChatRoot],
  initialGlobals: { font: 'roboto' },
  globalTypes: {
    font: {
      description: 'Шрифт чата',
      toolbar: {
        title: 'Шрифт',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: fontToolbarItems,
      },
    },
  },
}

export default preview
