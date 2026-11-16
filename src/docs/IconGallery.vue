<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseIcon from '../components/base/BaseIcon.vue'
import { icons, type IconName } from '../components/base/icons'
import { iconSvg } from './iconSvg'

const names = Object.keys(icons) as IconName[]
const query = ref('')
const strokeWidth = ref(2)
const selected = ref<IconName | null>(names[0] ?? null)
const notice = ref('')

const filtered = computed(() => {
  const text = query.value.trim().toLowerCase()
  return names.filter((name) => name.includes(text))
})

let noticeTimer: ReturnType<typeof setTimeout> | undefined

function showNotice(text: string) {
  notice.value = text
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 2000)
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    showNotice(`${label}: скопировано`)
  } catch {
    showNotice('Не удалось скопировать')
  }
}

function download(name: IconName) {
  const blob = new Blob([iconSvg(name, { strokeWidth: strokeWidth.value })], {
    type: 'image/svg+xml',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}.svg`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="icon-gallery" :style="{ '--chat-icon-stroke-width': strokeWidth }">
    <header class="icon-gallery__toolbar">
      <input
        v-model="query"
        class="icon-gallery__search"
        type="search"
        placeholder="Поиск по имени"
      />
      <label class="icon-gallery__stroke">
        Толщина линии
        <input v-model.number="strokeWidth" type="range" min="1" max="3" step="0.25" />
        <span>{{ strokeWidth }}</span>
      </label>
      <span class="icon-gallery__count">{{ filtered.length }} из {{ names.length }}</span>
    </header>

    <div class="icon-gallery__body">
      <p v-if="filtered.length === 0" class="icon-gallery__empty">Ничего не найдено</p>
      <ul v-else class="icon-gallery__grid">
        <li v-for="name in filtered" :key="name">
          <button
            class="icon-gallery__item"
            :class="{ 'icon-gallery__item--selected': name === selected }"
            type="button"
            @click="selected = name"
          >
            <BaseIcon :name="name" :size="32" />
            <span class="icon-gallery__name">{{ name }}</span>
          </button>
        </li>
      </ul>

      <aside v-if="selected" class="icon-gallery__details">
        <div class="icon-gallery__preview">
          <BaseIcon :name="selected" :size="96" />
        </div>
        <h3 class="icon-gallery__title">{{ selected }}</h3>
        <pre class="icon-gallery__code">{{ iconSvg(selected, { strokeWidth }) }}</pre>
        <div class="icon-gallery__actions">
          <button type="button" @click="copy(iconSvg(selected, { strokeWidth }), 'SVG')">
            Копировать SVG
          </button>
          <button type="button" @click="copy(selected, 'Имя')">Копировать имя</button>
          <button type="button" @click="download(selected)">Скачать SVG</button>
        </div>
        <p class="icon-gallery__notice">{{ notice }}</p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.icon-gallery {
  padding: 24px;
  color: #222;
  font-family: system-ui, sans-serif;
}

.icon-gallery__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.icon-gallery__search {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
  width: 260px;
  font-size: 14px;
}

.icon-gallery__stroke {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.icon-gallery__count {
  color: #888;
  font-size: 14px;
}

.icon-gallery__body {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.icon-gallery__grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.icon-gallery__empty {
  flex: 1;
  color: #888;
}

.icon-gallery__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  padding: 16px 6px 10px;
  width: 100%;
  color: inherit;
}

.icon-gallery__item:hover {
  background-color: #f2f2f2;
}

.icon-gallery__item--selected {
  border-color: #3da9a7;
  background-color: #e8f5f4;
}

.icon-gallery__name {
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

.icon-gallery__details {
  position: sticky;
  top: 24px;
  flex-shrink: 0;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  width: 340px;
}

.icon-gallery__preview {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-color: #f6f6f6;
  height: 160px;
}

.icon-gallery__title {
  margin: 16px 0 8px;
  font-size: 18px;
}

.icon-gallery__code {
  margin: 0 0 12px;
  border-radius: 8px;
  background-color: #f6f6f6;
  padding: 10px;
  max-height: 160px;
  overflow: auto;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
}

.icon-gallery__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-gallery__actions button {
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  padding: 7px 12px;
  font-size: 13px;
}

.icon-gallery__actions button:hover {
  background-color: #f2f2f2;
}

.icon-gallery__notice {
  margin: 10px 0 0;
  height: 18px;
  color: #31b874;
  font-size: 13px;
}
</style>
