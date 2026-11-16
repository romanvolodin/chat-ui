import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { extractPaths, generateIconsSource, outputFile } from '../../scripts/icons'

describe('icons.ts', () => {
  it('соответствует файлам в src/icons (иначе запустите npm run icons)', async () => {
    expect(readFileSync(outputFile, 'utf8')).toBe(await generateIconsSource())
  })
})

const svg = (content: string, viewBox = '0 0 24 24') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">${content}</svg>`

describe('extractPaths', () => {
  it('превращает круг в контур', () => {
    expect(extractPaths('test', svg('<circle cx="12" cy="12" r="5"/>'))).toHaveLength(1)
  })

  it('превращает прямоугольник без скругления в контур', () => {
    expect(extractPaths('test', svg('<rect x="3" y="3" width="18" height="18"/>'))).toHaveLength(1)
  })

  it('превращает скруглённый прямоугольник в контур', () => {
    const [path] = extractPaths('test', svg('<rect x="9" y="2" width="6" height="12" rx="3"/>'))
    expect(path).toMatch(/^M/i)
    expect(path).toContain('a')
  })

  it('сохраняет контуры как есть', () => {
    expect(extractPaths('test', svg('<path d="M4 6h16"/><path d="M4 12h16"/>'))).toHaveLength(2)
  })

  it('отвергает иконку с заливкой', () => {
    expect(() => extractPaths('test', svg('<path d="M4 6h16" fill="#000"/>'))).toThrow('заливка')
  })

  it('принимает fill="none" и разрешает заливку через стиль только none', () => {
    expect(() => extractPaths('test', svg('<path d="M4 6h16" style="fill:none"/>'))).not.toThrow()
    expect(() => extractPaths('test', svg('<path d="M4 6h16" style="fill:#000"/>'))).toThrow(
      'заливка',
    )
  })

  it('отвергает иконку с другим холстом', () => {
    expect(() => extractPaths('test', svg('<path d="M4 6h16"/>', '0 0 16 16'))).toThrow('viewBox')
  })

  it('отвергает файл без контуров', () => {
    expect(() => extractPaths('test', svg(''))).toThrow('нет ни одного контура')
  })
})
