/**
 * Иконки нарисованы на сетке 24×24 линией без заливки: толщина задаётся
 * `--chat-icon-stroke-width`, окончания и сгибы скруглены. Каждая иконка это список контуров.
 */
export const icons = {
  'arrow-left': ['M19 12H5', 'M12 19l-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'M12 5l7 7-7 7'],
  'arrow-up': ['M12 19V5', 'M5 12l7-7 7 7'],
  'arrow-down': ['M12 5v14', 'M19 12l-7 7-7-7'],
  'chevron-left': ['M15 18l-6-6 6-6'],
  'chevron-right': ['M9 18l6-6-6-6'],
  'chevron-up': ['M18 15l-6-6-6 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  'more-vertical': [
    'M12 4a1 1 0 1 0 0 2 1 1 0 1 0 0-2z',
    'M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2z',
    'M12 18a1 1 0 1 0 0 2 1 1 0 1 0 0-2z',
  ],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14z', 'M21 21l-5-5'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['M20 6L9 17l-5-5'],
} as const satisfies Record<string, readonly string[]>

export type IconName = keyof typeof icons
