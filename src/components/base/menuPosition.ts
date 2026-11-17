export interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface MenuPlacement {
  left: number
  top: number
  maxHeight: number
}

const GAP = 8
const OFFSET = 4

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

/** Все координаты в одной системе (экранной), результат тоже. */
export function placeMenu(anchor: Bounds | Point, size: Size, bounds: Bounds): MenuPlacement {
  const minLeft = bounds.left + GAP
  const maxRight = bounds.right - GAP
  const minTop = bounds.top + GAP
  const maxBottom = bounds.bottom - GAP
  const maxHeight = Math.max(0, maxBottom - minTop)
  const height = Math.min(size.height, maxHeight)

  let left: number
  let top: number
  if ('x' in anchor) {
    left = anchor.x + size.width > maxRight ? anchor.x - size.width : anchor.x
    top = anchor.y + height > maxBottom ? anchor.y - height : anchor.y
  } else {
    left = anchor.right - size.width < minLeft ? anchor.left : anchor.right - size.width
    top =
      anchor.bottom + OFFSET + height > maxBottom
        ? anchor.top - OFFSET - height
        : anchor.bottom + OFFSET
  }

  return {
    left: clamp(left, minLeft, Math.max(minLeft, maxRight - size.width)),
    top: clamp(top, minTop, Math.max(minTop, maxBottom - height)),
    maxHeight,
  }
}
