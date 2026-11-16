// Файл создаёт `npm run icons` из src/icons/*.svg, вручную его не правят
export const icons = {
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
  check: ['M20 6 9 17l-5-5'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-up': ['m18 15-6-6-6 6'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  'more-vertical': [
    'M12 4a1 1 0 1 0 0 2 1 1 0 1 0 0-2',
    'M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2',
    'M12 18a1 1 0 1 0 0 2 1 1 0 1 0 0-2',
  ],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14', 'm21 21-5-5'],
} as const satisfies Record<string, readonly string[]>

export type IconName = keyof typeof icons
