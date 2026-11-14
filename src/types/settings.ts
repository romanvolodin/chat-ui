export interface ChatSettings {
  /** Название пояса, например `Europe/Moscow`. Не задан: пояс устройства. */
  timeZone?: string
  /** Замороженный момент для Киноинтерфейсов и Storybook. Не задан: идут реальные часы. */
  now?: Date
}
