import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { generateIconsSource, outputFile } from '../../scripts/icons'

describe('icons.ts', () => {
  it('соответствует файлам в src/icons (иначе запустите npm run icons)', async () => {
    expect(readFileSync(outputFile, 'utf8')).toBe(await generateIconsSource())
  })
})
