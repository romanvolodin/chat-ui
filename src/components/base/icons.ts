// Этот файл генерируется командой `npm run icons` из иконок src/icons/*.svg, вручную править не надо

export const icons = {
  'alert-circle': ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20', 'M12 7v6', 'M12 17h.01'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
  'check-double': ['M2 12.5 6.5 17l10-10', 'm9.5 15 2 2 10-10'],
  check: ['M20 6 9 17l-5-5'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-up': ['m18 15-6-6-6 6'],
  clock: ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20', 'M12 6v6l4 2'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  'more-vertical': [
    'M12 4a1 1 0 1 0 0 2 1 1 0 1 0 0-2',
    'M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2',
    'M12 18a1 1 0 1 0 0 2 1 1 0 1 0 0-2',
  ],
  plus: ['M12 5v14', 'M5 12h14'],
  'rotate-cw': ['M20 12a8 8 0 1 1-2.34-5.66L20 8.68', 'M20 4v4.68h-4.68'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14', 'm21 21-5-5'],
} as const satisfies Record<string, readonly string[]>

export type IconName = keyof typeof icons
