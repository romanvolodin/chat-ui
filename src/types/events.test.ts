import { describe, expectTypeOf, it } from 'vitest'
import type { ChatEvent, ChatEvents } from './events'

type EventOf<K extends ChatEvent['type']> = Extract<ChatEvent, { type: K }>

describe('ChatEvent', () => {
  it('содержит все события словаря', () => {
    expectTypeOf<ChatEvent['type']>().toEqualTypeOf<keyof ChatEvents>()
  })

  it('у события с данными поля нагрузки лежат рядом с type', () => {
    expectTypeOf<keyof EventOf<'selectChat'>>().toEqualTypeOf<'type' | 'chatId'>()
    expectTypeOf<EventOf<'selectChat'>['chatId']>().toEqualTypeOf<string>()
  })

  it('у события без данных есть только type', () => {
    expectTypeOf<keyof EventOf<'goToLatest'>>().toEqualTypeOf<'type'>()
  })
})
