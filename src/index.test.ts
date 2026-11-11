import { describe, expect, it } from 'vitest'

describe('точка входа пакета', () => {
  it('загружается без ошибок', async () => {
    await expect(import('./index')).resolves.toBeDefined()
  })
})
