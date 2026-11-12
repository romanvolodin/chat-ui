import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
  framework: '@storybook/vue3-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
}

export default config
