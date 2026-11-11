import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  globalIgnores(['dist/**', 'storybook-static/**', 'coverage/**']),

  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylisticTypeChecked,

  {
    // Файлы конфигурации лежат вне tsconfig.json, поэтому типы для них не проверяем
    files: ['*.config.{js,ts}'],
    extends: [vueTsConfigs.disableTypeChecked],
  },

  // Должен идти последним: отключает правила, конфликтующие с Prettier
  prettier,
)
