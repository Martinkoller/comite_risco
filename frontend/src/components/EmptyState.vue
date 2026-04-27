<script setup>
defineProps({
  title: { type: String, default: 'Nenhum item encontrado' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <h3>{{ title }}</h3>
    <p v-if="description" class="muted">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty {
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 2rem 1rem;
  text-align: center;
  display: grid;
  gap: 0.5rem;
}
.muted { color: var(--muted); font-size: 0.875rem; }
</style>
