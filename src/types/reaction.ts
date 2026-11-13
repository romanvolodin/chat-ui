import type { UserId } from './ids'

export type ReactionIcon = { emoji: string } | { imageUrl: string }

export interface Reaction {
  icon: ReactionIcon
  count: number
  isMine?: boolean
  /** Не больше трёх. Полный список поставивших запрашивается отдельно. */
  firstUserIds?: UserId[]
}
