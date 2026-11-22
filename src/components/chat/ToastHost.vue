<script setup lang="ts">
import { useToast } from '../../composables/toast'
import BaseToast from '../base/BaseToast.vue'

const { message } = useToast()
</script>

<template>
  <!-- Область с `aria-live` есть всегда, иначе скринридер не озвучит текст, появившийся вместе с ней -->
  <div class="chat-toast-host" role="status" aria-live="polite">
    <Transition name="chat-toast">
      <BaseToast v-if="message">{{ message }}</BaseToast>
    </Transition>
  </div>
</template>

<style>
.chat-toast-host {
  display: flex;
  position: absolute;
  top: calc(var(--chat-header-height) + 8px);
  left: 0;
  justify-content: center;
  z-index: 30;
  pointer-events: none;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
}

.chat-toast-enter-active,
.chat-toast-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.chat-toast-enter-from,
.chat-toast-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
