<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  color: { type: String, default: 'var(--primary)' },
  icon: { type: String, default: '' },
  desc: { type: String, default: '' },
  accent: { type: Boolean, default: false },
})
</script>

<template>
  <div class="db-stat-card" :class="{ 'db-stat-accent': accent }">
    <div class="db-stat-top">
      <span class="db-stat-icon" v-if="icon">{{ icon }}</span>
      <span class="db-stat-label">{{ label }}</span>
    </div>
    <span class="db-stat-value" :style="{ color }">{{ value }}</span>
    <span v-if="desc" class="db-stat-desc">{{ desc }}</span>
  </div>
</template>

<style scoped>
.db-stat-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.1rem 1.25rem 1rem;
  background: var(--surface);
  display: grid;
  gap: 0.2rem;
  transition: box-shadow 0.15s;
}
.db-stat-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}
.db-stat-accent {
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--surface) 60%, rgba(37,99,235,0.04));
}
.db-stat-top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}
.db-stat-icon {
  font-size: 1rem;
  line-height: 1;
}
.db-stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.db-stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.db-stat-desc {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 0.1rem;
}
</style>
