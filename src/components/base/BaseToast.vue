<template>
  <div class="chat-toast"><slot /></div>
</template>

<style>
.chat-toast {
  box-sizing: border-box;
  box-shadow: 0 4px 16px #00000033;
  border-radius: 12px;
  background-color: var(--chat-overlay-background);
  padding: 10px 16px;
  max-width: min(420px, 100%);
  text-align: center;
  color: var(--chat-overlay-color);
}
</style>
