interface VisualMedia {
  url: string
  width: number
  height: number
  /** Если не задана, показывается сам файл */
  thumbnailUrl?: string
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

export type MessageContent =
  ImageContent | VideoContent | AlbumContent | FileContent | AudioContent | VideoCircleContent
