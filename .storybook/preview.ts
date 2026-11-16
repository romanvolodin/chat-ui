import type { Preview } from '@storybook/vue3-vite'
import '../src/index'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div class="chat-root"><story /></div>' })],
}

export default preview
