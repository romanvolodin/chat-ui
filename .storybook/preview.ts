import type { Preview } from '@storybook/vue3-vite'
import '../src/styles/theme.css'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div class="chat-root"><story /></div>' })],
}

export default preview
