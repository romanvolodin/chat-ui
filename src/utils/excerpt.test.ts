import { describe, expect, it } from 'vitest'
import type { FormattedText } from '../types'
import { chatListExcerpt, excerptText, plainText } from './excerpt'

const users = {
  me: { id: 'me', name: 'Роман' },
  ivan: { id: 'ivan', name: 'Иван' },
}

const text = (value: string): FormattedText => [{ text: value }]

describe('plainText', () => {
  it('склеивает сегменты', () => {
    expect(plainText([{ text: 'Привет, ' }, { text: 'мир', format: ['bold'] }])).toBe('Привет, мир')
  })

  it('заменяет переводы строк и повторные пробелы одним пробелом', () => {
    expect(plainText(text('  первая\n\nвторая   строка  '))).toBe('первая вторая строка')
  })

  it('для пустого списка возвращает пустую строку', () => {
    expect(plainText([])).toBe('')
  })
})

describe('excerptText', () => {
  it('показывает текст, если он есть', () => {
    expect(excerptText({ text: text('Привет') })).toBe('Привет')
  })

  it('текст важнее подписи по типу', () => {
    expect(excerptText({ text: text('Смотри'), contentKind: 'image' })).toBe('Смотри')
  })

  it.each([
    ['image', 'Фото'],
    ['video', 'Видео'],
    ['album', 'Альбом'],
    ['file', 'Файл'],
    ['audio', 'Голосовое сообщение'],
    ['videoCircle', 'Видеосообщение'],
    ['sticker', 'Стикер'],
    ['poll', 'Опрос'],
    ['location', 'Геопозиция'],
    ['contact', 'Контакт'],
    ['call', 'Звонок'],
  ] as const)('без текста для %s показывает «%s»', (contentKind, label) => {
    expect(excerptText({ contentKind })).toBe(label)
  })

  it('пустой текст не заслоняет подпись по типу', () => {
    expect(excerptText({ text: text('   '), contentKind: 'video' })).toBe('Видео')
  })

  it('без текста и вложения возвращает пустую строку', () => {
    expect(excerptText({})).toBe('')
  })
})

describe('chatListExcerpt', () => {
  const options = (chatType: 'private' | 'group' | 'channel' | 'discussion') => ({
    chatType,
    users,
    currentUserId: 'me',
  })

  it('свои сообщения подписывает «Вы:» в любом чате', () => {
    const excerpt = { authorId: 'me', text: text('Готово') }
    expect(chatListExcerpt(excerpt, options('private'))).toBe('Вы: Готово')
    expect(chatListExcerpt(excerpt, options('group'))).toBe('Вы: Готово')
  })

  it('в личном чате сообщение собеседника без имени', () => {
    expect(chatListExcerpt({ authorId: 'ivan', text: text('Привет') }, options('private'))).toBe(
      'Привет',
    )
  })

  it.each(['group', 'channel', 'discussion'] as const)(
    'в чате «%s» добавляет имя автора',
    (type) => {
      expect(chatListExcerpt({ authorId: 'ivan', text: text('Привет') }, options(type))).toBe(
        'Иван: Привет',
      )
    },
  )

  it('неизвестного автора подписывает заглушкой', () => {
    expect(chatListExcerpt({ authorId: 'ghost', text: text('Привет') }, options('group'))).toBe(
      'Неизвестный пользователь: Привет',
    )
  })

  it('к вложению добавляет подпись по типу и автора', () => {
    expect(chatListExcerpt({ authorId: 'ivan', contentKind: 'image' }, options('group'))).toBe(
      'Иван: Фото',
    )
    expect(chatListExcerpt({ authorId: 'me', contentKind: 'audio' }, options('private'))).toBe(
      'Вы: Голосовое сообщение',
    )
  })

  it('у системных сообщений автора не пишет', () => {
    expect(
      chatListExcerpt(
        { authorId: 'ivan', isSystem: true, text: text('Иван вступил') },
        options('group'),
      ),
    ).toBe('Иван вступил')
  })

  it('без автора возвращает только текст', () => {
    expect(chatListExcerpt({ text: text('Чат создан') }, options('group'))).toBe('Чат создан')
  })
})
