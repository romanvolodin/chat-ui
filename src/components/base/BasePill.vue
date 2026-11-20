<template>
  <span class="chat-pill"><slot /></span>
</template>

<style>
.chat-pill {
  display: inline-block;
  border-radius: var(--chat-bubble-radius);
  background-color: var(--chat-overlay-background);
  padding: 3px 12px;
  max-width: 90%;
  text-align: center;
  color: var(--chat-overlay-color);
  font-size: 0.9em;
}
</style>
