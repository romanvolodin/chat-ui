import { describe, expect, it } from 'vitest'
import { isBlank, segmentsToText, textToSegments, trimSegments } from './composerText'

describe('segmentsToText / textToSegments', () => {
  it('склеивает сегменты в исходный текст', () => {
    expect(segmentsToText([{ text: 'Привет, ' }, { text: 'мир', format: ['bold'] }])).toBe(
      'Привет, мир',
    )
  })

  it('пустой список даёт пустую строку', () => {
    expect(segmentsToText([])).toBe('')
  })

  it('текст превращает в один сегмент без оформления', () => {
    expect(textToSegments('Привет\nмир')).toEqual([{ text: 'Привет\nмир' }])
  })

  it('пустая строка даёт пустой список', () => {
    expect(textToSegments('')).toEqual([])
  })

  it('туда и обратно текст не меняется', () => {
    expect(segmentsToText(textToSegments('  a \n b  '))).toBe('  a \n b  ')
  })
})

describe('isBlank', () => {
  it.each([[[]], [[{ text: '' }]], [[{ text: '  \n ' }]], [[{ text: ' ' }, { text: '\t' }]]])(
    'пустым считается %j',
    (text) => {
      expect(isBlank(text)).toBe(true)
    },
  )

  it('текст не пуст', () => {
    expect(isBlank([{ text: ' а ' }])).toBe(false)
  })
})

describe('trimSegments', () => {
  it('обрезает начало и конец одного сегмента', () => {
    expect(trimSegments([{ text: '  Привет\n' }])).toEqual([{ text: 'Привет' }])
  })

  it('обрезает только края всего текста, а не каждого сегмента', () => {
    expect(trimSegments([{ text: ' а ' }, { text: ' б ', format: ['bold'] }])).toEqual([
      { text: 'а ' },
      { text: ' б', format: ['bold'] },
    ])
  })

  it('убирает крайние сегменты, если они целиком из пробелов', () => {
    expect(
      trimSegments([{ text: ' ' }, { text: 'жирный', format: ['bold'] }, { text: '\n' }]),
    ).toEqual([{ text: 'жирный', format: ['bold'] }])
  })

  it('сохраняет оформление, ссылки и упоминания', () => {
    const text = [{ text: '@Анна', format: ['mention' as const], userId: 'anna' }]
    expect(trimSegments(text)).toEqual(text)
  })

  it('не меняет исходные сегменты', () => {
    const source = [{ text: ' а ' }]
    trimSegments(source)
    expect(source).toEqual([{ text: ' а ' }])
  })

  it('пустой текст остаётся пустым', () => {
    expect(trimSegments([{ text: '  ' }])).toEqual([])
  })
})
