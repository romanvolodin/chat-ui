<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
    isDisabled?: boolean
  }>(),
  { variant: 'secondary', isDisabled: false },
)
</script>

<template>
  <button
    class="chat-button"
    type="button"
    :class="`chat-button--${variant}`"
    :disabled="isDisabled"
  >
    <slot />
  </button>
</template>

<style>
.chat-button {
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0;
  border: none;
  border-radius: 10px;
  padding: 0 20px;
  min-height: 40px;
  white-space: nowrap;
  font: inherit;
  font-weight: 500;
  font-size: 15px;
}

.chat-button:focus-visible {
  outline: 2px solid var(--chat-accent);
  outline-offset: 2px;
}

.chat-button:disabled {
  cursor: default;
  opacity: 0.4;
}

.chat-button--primary {
  background-color: var(--chat-accent);
  color: var(--chat-on-accent);
}

.chat-button--primary:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--chat-accent) 90%, #000);
}

.chat-button--secondary {
  background-color: var(--chat-accent-tint);
  color: var(--chat-accent-text);
}

.chat-button--secondary:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--chat-accent) 28%, transparent);
}

.chat-button--danger {
  background-color: var(--chat-danger);
  color: var(--chat-on-danger);
}

.chat-button--danger:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--chat-danger) 90%, #000);
}
</style>
