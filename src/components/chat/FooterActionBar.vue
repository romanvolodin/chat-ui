<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <button class="chat-footer-action" type="button">{{ label }}</button>
</template>

<style>
.chat-footer-action {
  cursor: pointer;
  margin: 0;
  border: none;
  background: none;
  width: 100%;
  min-height: var(--chat-footer-bar-height);
  color: var(--chat-accent-text);
  font: inherit;
  font-weight: 500;
}

.chat-footer-action:hover {
  background-color: var(--chat-surface-hover);
}

.chat-footer-action:focus-visible {
  outline: 2px solid var(--chat-accent);
  outline-offset: -2px;
}
</style>
