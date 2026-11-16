import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { format, resolveConfig } from 'prettier'
import { optimize } from 'svgo'

const root = join(import.meta.dirname, '..')
export const iconsDir = join(root, 'src/icons')
export const outputFile = join(root, 'src/components/base/icons.ts')

const namePattern = /^[a-z]+(-[a-z]+)*$/
const unsupportedShape = /<(?:rect|circle|ellipse|line|polyline|polygon|text|image|use)\b/
const fillAttribute = /\sfill="(?!none")[^"]*"|fill:\s*(?!none)[^;"]+/

function extractPaths(name: string, source: string): string[] {
  if (!source.includes('viewBox="0 0 24 24"')) {
    throw new Error(`${name}.svg: нужен viewBox="0 0 24 24"`)
  }
  const { data } = optimize(source, {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            convertShapeToPath: { convertArcs: true },
            mergePaths: false,
          },
        },
      },
      'convertTransform',
    ],
  })
  if (unsupportedShape.test(data)) {
    throw new Error(`${name}.svg: остались фигуры, не превращённые в контуры`)
  }
  if (fillAttribute.test(data)) {
    throw new Error(
      `${name}.svg: есть заливка. Иконки рисуются линией: замените заливку обводкой (fill="none")`,
    )
  }
  const paths = [...data.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((match) => match[1] ?? '')
  if (paths.length === 0) throw new Error(`${name}.svg: нет ни одного контура`)
  return paths
}

export async function generateIconsSource(): Promise<string> {
  const files = readdirSync(iconsDir)
    .filter((file) => file.endsWith('.svg'))
    .sort()
  const entries = files.map((file) => {
    const name = basename(file, '.svg')
    if (!namePattern.test(name)) {
      throw new Error(`${file}: имя должно быть строчными буквами через дефис`)
    }
    const paths = extractPaths(name, readFileSync(join(iconsDir, file), 'utf8'))
    return `  '${name}': [${paths.map((path) => `'${path}'`).join(', ')}],`
  })
  const source = [
    '// Этот файл генерируется командой `npm run icons` из иконок src/icons/*.svg, вручную править не надо',
    'export const icons = {',
    ...entries,
    '} as const satisfies Record<string, readonly string[]>',
    '',
    'export type IconName = keyof typeof icons',
    '',
  ].join('\n')
  const config = await resolveConfig(outputFile)
  return format(source, { ...config, filepath: outputFile })
}

if (process.argv[1] === import.meta.filename) {
  writeFileSync(outputFile, await generateIconsSource())
}
