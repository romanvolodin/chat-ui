import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const fonts = {
  roboto: { title: 'Roboto', family: 'Roboto, system-ui, sans-serif' },
  inter: { title: 'Inter', family: 'Inter, system-ui, sans-serif' },
  system: { title: 'Системный', family: 'system-ui, sans-serif' },
  serif: { title: 'С засечками', family: 'Georgia, serif' },
}

export const fontFamilies: Record<string, string> = Object.fromEntries(
  Object.entries(fonts).map(([value, { family }]) => [value, family]),
)

export const fontToolbarItems = Object.entries(fonts).map(([value, { title }]) => ({
  value,
  title,
}))
