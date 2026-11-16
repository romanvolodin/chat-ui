import { describe, expect, it } from 'vitest'
import { AVATAR_COLOR_COUNT, getColorIndex, getInitials } from './avatarAppearance'

describe('getInitials', () => {
  it('берёт первые буквы имени и фамилии', () => {
    expect(getInitials('Иван Петров')).toBe('ИП')
  })

  it('для одного слова берёт одну букву', () => {
    expect(getInitials('Дмитрий')).toBe('Д')
  })

  it('берёт первое и последнее слово, если слов больше двух', () => {
    expect(getInitials('Анна Мария Иванова')).toBe('АИ')
  })

  it('делает буквы заглавными', () => {
    expect(getInitials('helper bot')).toBe('HB')
  })

  it('игнорирует лишние пробелы', () => {
    expect(getInitials('  Иван   Петров  ')).toBe('ИП')
  })

  it('не разрывает символы, занимающие две кодовые единицы', () => {
    expect(getInitials('😀 Бот')).toBe('😀Б')
  })

  it('для пустого имени возвращает знак вопроса', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })
})

describe('getColorIndex', () => {
  it('всегда возвращает номер в пределах палитры', () => {
    const names = ['', 'Иван Петров', 'Helper Bot', 'a', 'Очень длинное имя пользователя без конца']
    for (const name of names) {
      const index = getColorIndex(name)
      expect(index).toBeGreaterThanOrEqual(1)
      expect(index).toBeLessThanOrEqual(AVATAR_COLOR_COUNT)
    }
  })

  it('для одного имени даёт один и тот же номер', () => {
    expect(getColorIndex('Иван Петров')).toBe(getColorIndex('Иван Петров'))
  })

  it('совпадает с цветами из chat-app', () => {
    expect(getColorIndex('Анна Иванова')).toBe(6)
    expect(getColorIndex('Иван Петров')).toBe(2)
    expect(getColorIndex('Helper Bot')).toBe(4)
    expect(getColorIndex('')).toBe(1)
  })
})
