# chat-ui

## Storybook

Проект использует Storybook для разработки и тестирования компонентов.

### Запуск

```bash
npm run storybook
```

Открывается <http://localhost:6006>. Изменения в коде подхватываются на лету.

### Где писать истории

Рядом с компонентом, файл `Имя.stories.ts`. Например, `src/message/MessageBubble.stories.ts` рядом с `MessageBubble.vue`.

### Минимальная история

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MessageBubble from './MessageBubble.vue'

const meta = {
  title: 'message/MessageBubble',
  component: MessageBubble,
} satisfies Meta<typeof MessageBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Входящее: Story = {
  args: { text: 'Привет!', outgoing: false },
}

export const Исходящее: Story = {
  args: { text: 'Привет!', outgoing: true },
}
```

Один экспорт — одно состояние компонента. Названия состояний пишем по смыслу: «пустой чат», «длинный текст», «ошибка отправки».

### Как пользоваться

- Слева выбираешь историю, внизу панель **Controls** позволяет менять props на лету.
- Вкладка **Docs** показывает автодокументацию: описание, props и все состояния компонента на одной странице. Она включена для всех историй.
- Новый компонент разрабатывай сразу в Storybook, а не в тестовом приложении: каждое состояние сразу получает историю.

### Проверка сборки

```bash
npm run build-storybook
```

Собирает статический сайт в `storybook-static/` (в Git не попадает). Позже его будет публиковать GitHub Actions.
