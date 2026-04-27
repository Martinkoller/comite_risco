<script setup>
import { useToast } from '@/composables/useToast'
import ToastNotification from './ToastNotification.vue'

const { toasts, remove } = useToast()
</script>

<template>
  <div class="toast-container">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="0"
      :show="toast.visible"
      @close="remove(toast.id)"
    />
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed; top: 1rem; right: 1rem;
  z-index: 2000;
  display: flex; flex-direction: column; gap: 0.5rem;
  pointer-events: none;
}
.toast-container > * { pointer-events: auto; }
@media (max-width: 640px) {
  .toast-container { left: 1rem; right: 1rem; }
}
</style>
