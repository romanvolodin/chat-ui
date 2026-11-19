import { describe, expect, it } from 'vitest'
import { formatCount } from './formatCount'

describe('formatCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1K'],
    [1234, '1,2K'],
    [2900, '2,9K'],
    [15_000, '15K'],
    [999_999, '999,9K'],
    [1_000_000, '1M'],
    [1_550_000, '1,5M'],
  ])('%i → «%s»', (count, expected) => {
    expect(formatCount(count)).toBe(expected)
  })
})
