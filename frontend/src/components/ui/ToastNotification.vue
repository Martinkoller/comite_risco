<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  message: String,
  type: { type: String, default: 'info', validator: (v) => ['success', 'error', 'warning', 'info'].includes(v) },
  duration: { type: Number, default: 4000 },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const visible = ref(false)
const animating = ref(false)

watch(() => props.show, (v) => v ? showToast() : hideToast())

function showToast() {
  visible.value = true
  animating.value = true
  if (props.duration > 0) setTimeout(hideToast, props.duration)
}
function hideToast() {
  animating.value = false
  setTimeout(() => { visible.value = false; emit('close') }, 300)
}

onMounted(() => { if (props.show) showToast() })
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="type" @click="hideToast">
      <div class="toast-icon">
        <span v-if="type === 'success'">✅</span>
        <span v-else-if="type === 'error'">❌</span>
        <span v-else-if="type === 'warning'">⚠️</span>
        <span v-else>ℹ️</span>
      </div>
      <div class="toast-content">
        <p class="toast-message">{{ message }}</p>
      </div>
      <button class="toast-close" @click.stop="hideToast" aria-label="Fechar">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed; top: 1rem; right: 1rem; z-index: 2000;
  display: flex; align-items: center; gap: 0.75rem;
  min-width: 300px; max-width: 500px;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}
.toast:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
.toast.success { background: color-mix(in srgb, #10b981 10%, white); border: 1px solid #10b981; color: #065f46; }
.toast.error   { background: color-mix(in srgb, #ef4444 10%, white); border: 1px solid #ef4444; color: #7f1d1d; }
.toast.warning { background: color-mix(in srgb, #f59e0b 10%, white); border: 1px solid #f59e0b; color: #78350f; }
.toast.info    { background: color-mix(in srgb, #3b82f6 10%, white); border: 1px solid #3b82f6; color: #1e3a8a; }
.toast-icon { font-size: 1.25rem; flex-shrink: 0; }
.toast-content { flex: 1; min-width: 0; }
.toast-message { margin: 0; font-weight: 500; line-height: 1.4; }
.toast-close { background: none; border: none; font-size: 1rem; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; padding: 0.25rem; border-radius: 4px; }
.toast-close:hover { opacity: 1; background: rgba(0,0,0,0.1); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100%); }
@media (max-width: 640px) {
  .toast { left: 1rem; right: 1rem; min-width: auto; max-width: none; }
}
</style>
