import { describe, expect, it } from 'vitest'
import { pluralize } from './plural'

const minutes = ['минуту', 'минуты', 'минут'] as const

describe('pluralize', () => {
  it.each([
    [1, 'минуту'],
    [2, 'минуты'],
    [4, 'минуты'],
    [5, 'минут'],
    [11, 'минут'],
    [14, 'минут'],
    [21, 'минуту'],
    [22, 'минуты'],
    [100, 'минут'],
    [111, 'минут'],
    [121, 'минуту'],
  ])('для %i выбирает «%s»', (count, expected) => {
    expect(pluralize(count, minutes)).toBe(expected)
  })
})
