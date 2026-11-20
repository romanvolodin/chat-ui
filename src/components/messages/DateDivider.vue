<script setup lang="ts">
import { computed } from 'vue'
import { useChatContext } from '../../composables/chatContext'
import { formatDayHeading, getDayKey } from '../../utils/dateTime'
import BasePill from '../base/BasePill.vue'

const props = defineProps<{ date: Date }>()

const { now, timeZone } = useChatContext()

const label = computed(() => formatDayHeading(props.date, now.value, timeZone.value))
const dayKey = computed(() => getDayKey(props.date, timeZone.value))
</script>

<template>
  <div class="chat-date-divider">
    <BasePill
      ><time :datetime="dayKey">{{ label }}</time></BasePill
    >
  </div>
</template>

<style>
.chat-date-divider {
  display: flex;
  justify-content: center;
}
</style>
