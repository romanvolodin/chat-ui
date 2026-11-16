import type { Meta, StoryObj } from '@storybook/vue3-vite'
import IconGallery from './IconGallery.vue'

const meta = {
  title: 'Иконки',
  component: IconGallery,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof IconGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Галерея: Story = {}
