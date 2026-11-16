import { icons, type IconName } from '../components/base/icons'

interface IconSvgOptions {
  size?: number
  strokeWidth?: number
}

export function iconSvg(name: IconName, { size = 24, strokeWidth = 2 }: IconSvgOptions = {}) {
  const paths = icons[name].map((path) => `  <path d="${path}"/>`).join('\n')
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(size)}" height="${String(size)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${String(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`,
    paths,
    '</svg>',
    '',
  ].join('\n')
}
