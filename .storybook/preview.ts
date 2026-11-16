import type { Decorator, Preview } from '@storybook/vue3-vite'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '../src/index'

const fonts: Record<string, string> = {
  roboto: 'Roboto, system-ui, sans-serif',
  inter: 'Inter, system-ui, sans-serif',
  system: 'system-ui, sans-serif',
  serif: 'Georgia, serif',
}

const withChatRoot: Decorator = (_story, context) => ({
  setup: () => ({ fontFamily: fonts[String(context.globals['font'])] }),
  template:
    '<div class="chat-root" :style="{ \'--chat-font-family\': fontFamily }"><story /></div>',
})

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
        items: [
          { value: 'roboto', title: 'Roboto' },
          { value: 'inter', title: 'Inter' },
          { value: 'system', title: 'Системный' },
          { value: 'serif', title: 'С засечками' },
        ],
      },
    },
  },
}

export default preview
