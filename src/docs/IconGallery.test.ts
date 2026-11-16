import { describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import { icons } from '../components/base/icons'
import IconGallery from './IconGallery.vue'

function mount() {
  const container = document.createElement('div')
  createApp(IconGallery).mount(container)
  return container
}

describe('IconGallery', () => {
  it('показывает все иконки', () => {
    const container = mount()
    expect(container.querySelectorAll('.icon-gallery__item')).toHaveLength(
      Object.keys(icons).length,
    )
  })

  it('фильтрует иконки по имени', async () => {
    const container = mount()
    const search = container.querySelector<HTMLInputElement>('.icon-gallery__search')
    if (!search) throw new Error('нет поля поиска')
    search.value = 'chevron'
    search.dispatchEvent(new Event('input'))
    await nextTick()
    const names = [...container.querySelectorAll('.icon-gallery__name')].map((el) => el.textContent)
    expect(names.length).toBeGreaterThan(0)
    expect(names.every((name) => name.includes('chevron'))).toBe(true)
  })

  it('показывает сообщение, если ничего не найдено', async () => {
    const container = mount()
    const search = container.querySelector<HTMLInputElement>('.icon-gallery__search')
    if (!search) throw new Error('нет поля поиска')
    search.value = 'такой-иконки-нет'
    search.dispatchEvent(new Event('input'))
    await nextTick()
    expect(container.querySelector('.icon-gallery__empty')).not.toBeNull()
  })

  it('показывает код выбранной иконки', async () => {
    const container = mount()
    const items = container.querySelectorAll<HTMLButtonElement>('.icon-gallery__item')
    items[1]?.click()
    await nextTick()
    const name = items[1]?.querySelector('.icon-gallery__name')?.textContent
    expect(container.querySelector('.icon-gallery__title')?.textContent).toBe(name)
    expect(container.querySelector('.icon-gallery__code')?.textContent).toContain('<svg')
  })
})
