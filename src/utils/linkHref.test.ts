import { describe, expect, it } from 'vitest'
import { linkHref } from './linkHref'

describe('linkHref', () => {
  it.each([
    ['https://example.com/a?b=1', 'https://example.com/a?b=1'],
    ['HTTP://example.com', 'HTTP://example.com'],
    ['mailto:me@example.com', 'mailto:me@example.com'],
    ['tel:+79990000000', 'tel:+79990000000'],
    ['  https://example.com  ', 'https://example.com'],
  ])('«%s» оставляет как есть', (url, expected) => {
    expect(linkHref(url)).toBe(expected)
  })

  it('адрес без схемы считает адресом сайта', () => {
    expect(linkHref('example.com/path')).toBe('https://example.com/path')
  })

  it.each(['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,<b>x</b>', 'vbscript:x'])(
    'небезопасную схему «%s» отвергает',
    (url) => {
      expect(linkHref(url)).toBeUndefined()
    },
  )

  it('пустой адрес отвергает', () => {
    expect(linkHref('  ')).toBeUndefined()
  })
})
