import type { UserId } from './ids'

export type MediaKind = 'image' | 'video'

export interface MediaPreview {
  url: string
  media: MediaKind
}

interface SizedMedia {
  url: string
  width: number
  height: number
}

interface VisualMedia extends SizedMedia {
  /** Лёгкая версия для чата. Если не задана, показывается сам файл. */
  preview?: MediaPreview
}

export interface ImageContent extends VisualMedia {
  type: 'image'
}

export interface VideoContent extends VisualMedia {
  type: 'video'
  durationSeconds: number
}

/** Картинки и/или видео. Подпись альбома лежит в тексте сообщения. */
export interface AlbumContent {
  type: 'album'
  items: (ImageContent | VideoContent)[]
}

export interface FileContent {
  type: 'file'
  url: string
  name: string
  sizeBytes: number
}

export interface AudioContent {
  type: 'audio'
  url: string
  durationSeconds: number
  /** Значения громкости от 0 до 1 для «волны». Без списка показывается полоса прогресса. */
  waveform?: number[]
}

export interface VideoCircleContent {
  type: 'videoCircle'
  url: string
  durationSeconds?: number
}

export interface StickerContent extends SizedMedia {
  type: 'sticker'
  media: MediaKind
}

export interface PollOption {
  id: string
  text: string
  voteCount: number
  isChosen?: boolean
}

export interface PollContent {
  type: 'poll'
  question: string
  options: PollOption[]
}

export interface LocationContent {
  type: 'location'
  latitude: number
  longitude: number
  /** Подпись под картой, например название места. */
  label?: string
  /** Картинка вместо настоящей карты. */
  previewUrl: string
}

export interface ContactContent {
  type: 'contact'
  userId: UserId
}

export type CallDirection = 'incoming' | 'outgoing'

export type CallKind = 'audio' | 'video'

/** `cancelled`: звонок отменил сам звонящий, `declined`: его отклонил получатель. */
export type CallResult = 'completed' | 'missed' | 'declined' | 'noAnswer' | 'cancelled'

export interface CallContent {
  type: 'call'
  direction: CallDirection
  kind: CallKind
  result: CallResult
  /** Только у состоявшегося звонка. */
  durationSeconds?: number
}

export type MessageContent =
  | ImageContent
  | VideoContent
  | AlbumContent
  | FileContent
  | AudioContent
  | VideoCircleContent
  | StickerContent
  | PollContent
  | LocationContent
  | ContactContent
  | CallContent
