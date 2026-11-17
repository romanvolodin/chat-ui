import { describe, expect, it } from 'vitest'
import { placeMenu } from './menuPosition'

const bounds = { left: 0, top: 0, right: 400, bottom: 600 }
const size = { width: 200, height: 100 }

describe('placeMenu: точка', () => {
  it('открывает меню правее и ниже точки, если помещается', () => {
    expect(placeMenu({ x: 50, y: 60 }, size, bounds)).toMatchObject({ left: 50, top: 60 })
  })

  it('разворачивает меню влево у правого края', () => {
    expect(placeMenu({ x: 380, y: 60 }, size, bounds)).toMatchObject({ left: 180, top: 60 })
  })

  it('разворачивает меню вверх у нижнего края', () => {
    expect(placeMenu({ x: 50, y: 580 }, size, bounds)).toMatchObject({ left: 50, top: 480 })
  })

  it('разворачивает в обе стороны в правом нижнем углу', () => {
    expect(placeMenu({ x: 390, y: 590 }, size, bounds)).toMatchObject({ left: 190, top: 490 })
  })

  it('не выпускает меню за левый и верхний край', () => {
    expect(placeMenu({ x: -50, y: -20 }, size, bounds)).toMatchObject({ left: 8, top: 8 })
  })
})

describe('placeMenu: элемент', () => {
  const button = { left: 300, right: 340, top: 10, bottom: 50 }

  it('открывает меню под элементом по его правому краю', () => {
    expect(placeMenu(button, size, bounds)).toMatchObject({ left: 140, top: 54 })
  })

  it('выравнивает по левому краю элемента, если справа налево не помещается', () => {
    const nearLeft = { left: 10, right: 50, top: 10, bottom: 50 }
    expect(placeMenu(nearLeft, size, bounds)).toMatchObject({ left: 10, top: 54 })
  })

  it('открывает меню над элементом, если снизу не помещается', () => {
    const nearBottom = { left: 300, right: 340, top: 540, bottom: 580 }
    expect(placeMenu(nearBottom, size, bounds)).toMatchObject({ left: 140, top: 436 })
  })
})

describe('placeMenu: ограничения', () => {
  it('ограничивает высоту границами и прижимает к верху', () => {
    const result = placeMenu({ x: 50, y: 300 }, { width: 200, height: 900 }, bounds)
    expect(result.maxHeight).toBe(584)
    expect(result.top).toBe(8)
  })

  it('прижимает к левому краю, если меню шире границ', () => {
    const narrow = { left: 0, top: 0, right: 150, bottom: 600 }
    expect(placeMenu({ x: 20, y: 20 }, size, narrow).left).toBe(8)
  })

  it('учитывает смещение границ', () => {
    const shifted = { left: 100, top: 100, right: 500, bottom: 700 }
    expect(placeMenu({ x: 20, y: 20 }, size, shifted)).toMatchObject({ left: 108, top: 108 })
  })
})
