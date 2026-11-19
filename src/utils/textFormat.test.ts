import { describe, expect, it } from 'vitest'
import { orderFormats } from './textFormat'

describe('orderFormats', () => {
  it('без форматирования даёт пустой список', () => {
    expect(orderFormats()).toEqual([])
  })

  it('ставит блоки снаружи, а простое оформление внутри', () => {
    expect(orderFormats(['bold', 'link', 'quote'])).toEqual(['quote', 'link', 'bold'])
  })

  it('убирает повторы', () => {
    expect(orderFormats(['italic', 'italic'])).toEqual(['italic'])
  })

  it('порядок не зависит от порядка в данных', () => {
    expect(orderFormats(['underline', 'bold'])).toEqual(orderFormats(['bold', 'underline']))
  })
})
