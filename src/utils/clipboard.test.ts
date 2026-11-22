import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyToClipboard } from './clipboard'

function stubClipboard(clipboard: unknown) {
  Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
}

afterEach(() => {
  vi.restoreAllMocks()
  stubClipboard(undefined)
})

describe('copyToClipboard', () => {
  it('кладёт текст в буфер и сообщает об успехе', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard({ writeText })
    await expect(copyToClipboard('https://example.com')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledExactlyOnceWith('https://example.com')
  })

  it('если браузер отказал, сообщает о неудаче и не падает', async () => {
    stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) })
    await expect(copyToClipboard('x')).resolves.toBe(false)
  })

  it('если буфера обмена нет вообще, сообщает о неудаче', async () => {
    stubClipboard(undefined)
    await expect(copyToClipboard('x')).resolves.toBe(false)
  })
})
