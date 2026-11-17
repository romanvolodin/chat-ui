import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import BaseDropdownMenu, { type MenuItem } from './BaseDropdownMenu.vue'

const elements: HTMLElement[] = []

afterEach(() => {
  elements.splice(0).forEach((element) => {
    element.remove()
  })
})

const items: MenuItem[] = [
  { id: 'locked', label: 'Недоступно', isDisabled: true },
  { id: 'reply', label: 'Ответить', icon: 'reply' },
  { id: 'forward', label: 'Переслать' },
  { id: 'delete', label: 'Удалить', isDanger: true },
]

interface Options {
  isOpen?: boolean
  anchor?: 'element' | 'point'
}

function mount({ isOpen = true, anchor = 'element' }: Options = {}) {
  const open = ref(isOpen)
  const selected: string[] = []
  const trigger = document.createElement('button')
  const container = document.createElement('div')
  document.body.append(trigger, container)
  elements.push(trigger, container)
  trigger.focus()
  createApp({
    render: () =>
      h(BaseDropdownMenu, {
        modelValue: open.value,
        anchor: anchor === 'element' ? trigger : { x: 20, y: 30 },
        items,
        'onUpdate:modelValue': (value: boolean) => {
          open.value = value
        },
        onSelect: (id: string) => {
          selected.push(id)
        },
      }),
  }).mount(container)
  const menu = () => container.querySelector<HTMLElement>('.chat-menu')
  const buttons = () => [...container.querySelectorAll<HTMLButtonElement>('.chat-menu__item')]
  const press = (key: string, shiftKey = false) => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }),
    )
  }
  return { open, selected, trigger, container, menu, buttons, press }
}

const settle = async () => {
  await nextTick()
  await nextTick()
}

describe('BaseDropdownMenu', () => {
  it('не показывается, пока закрыто', () => {
    expect(mount({ isOpen: false }).menu()).toBeNull()
  })

  it('показывает пункты меню с подписями и ролями', () => {
    const { menu, buttons } = mount()
    expect(menu()?.getAttribute('role')).toBe('menu')
    expect(buttons().map((button) => button.textContent)).toEqual([
      'Недоступно',
      'Ответить',
      'Переслать',
      'Удалить',
    ])
    expect(buttons().every((button) => button.getAttribute('role') === 'menuitem')).toBe(true)
  })

  it('рисует иконку только у пункта, где она задана', () => {
    const { buttons } = mount()
    expect(buttons()[1]?.querySelector('svg')).not.toBeNull()
    expect(buttons()[2]?.querySelector('svg')).toBeNull()
  })

  it('отмечает опасный пункт', () => {
    const { buttons } = mount()
    expect(buttons()[3]?.classList.contains('chat-menu__item--danger')).toBe(true)
  })

  it('показывает меню после расчёта положения', async () => {
    const { menu } = mount()
    await settle()
    expect(menu()?.style.visibility).not.toBe('hidden')
    expect(menu()?.style.left).toMatch(/px$/)
  })

  it('принимает точку вместо элемента', async () => {
    const { menu } = mount({ anchor: 'point' })
    await settle()
    expect(menu()?.style.top).toMatch(/px$/)
  })

  it('при открытии фокусирует первый доступный пункт', async () => {
    const { buttons } = mount()
    await settle()
    expect(document.activeElement).toBe(buttons()[1])
  })

  it('по выбору пункта сообщает его id и закрывается', async () => {
    const { buttons, selected, open } = mount()
    await settle()
    buttons()[2]?.click()
    await nextTick()
    expect(selected).toEqual(['forward'])
    expect(open.value).toBe(false)
  })

  it('недоступный пункт не выбирается', async () => {
    const { buttons, selected, open } = mount()
    await settle()
    buttons()[0]?.click()
    await nextTick()
    expect(selected).toEqual([])
    expect(open.value).toBe(true)
  })

  it('закрывается по Escape', async () => {
    const { open, press } = mount()
    await settle()
    press('Escape')
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('закрывается по нажатию вне меню', async () => {
    const { open } = mount()
    await settle()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('не закрывается по нажатию внутри меню', async () => {
    const { open, menu } = mount()
    await settle()
    menu()?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(open.value).toBe(true)
  })

  it('не закрывается по нажатию на якорь-элемент', async () => {
    const { open, trigger } = mount()
    await settle()
    trigger.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(open.value).toBe(true)
  })

  it('закрывается при изменении размера окна', async () => {
    const { open } = mount()
    await settle()
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('закрывается по Tab', async () => {
    const { open, press } = mount()
    await settle()
    press('Tab')
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('переходит по пунктам стрелками по кругу, пропуская недоступные', async () => {
    const { buttons, press } = mount()
    await settle()
    press('ArrowDown')
    expect(document.activeElement).toBe(buttons()[2])
    press('ArrowDown')
    expect(document.activeElement).toBe(buttons()[3])
    press('ArrowDown')
    expect(document.activeElement).toBe(buttons()[1])
    press('ArrowUp')
    expect(document.activeElement).toBe(buttons()[3])
  })

  it('Home и End ведут к первому и последнему доступным пунктам', async () => {
    const { buttons, press } = mount()
    await settle()
    press('End')
    expect(document.activeElement).toBe(buttons()[3])
    press('Home')
    expect(document.activeElement).toBe(buttons()[1])
  })

  it('возвращает фокус туда, откуда меню открыли', async () => {
    const { trigger, open } = mount()
    await settle()
    expect(document.activeElement).not.toBe(trigger)
    open.value = false
    await settle()
    expect(document.activeElement).toBe(trigger)
  })
})
