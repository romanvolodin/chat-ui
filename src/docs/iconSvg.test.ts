import { describe, expect, it } from 'vitest'
import { icons } from '../components/base/icons'
import { iconSvg } from './iconSvg'

describe('iconSvg', () => {
  it('собирает самостоятельный SVG с контурами иконки', () => {
    const svg = iconSvg('arrow-left')
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    for (const path of icons['arrow-left']) expect(svg).toContain(`<path d="${path}"/>`)
  })

  it('по умолчанию размер 24 и толщина 2', () => {
    const svg = iconSvg('check')
    expect(svg).toContain('width="24" height="24"')
    expect(svg).toContain('stroke-width="2"')
  })

  it('учитывает размер и толщину', () => {
    const svg = iconSvg('check', { size: 48, strokeWidth: 1.5 })
    expect(svg).toContain('width="48" height="48"')
    expect(svg).toContain('stroke-width="1.5"')
  })
})
