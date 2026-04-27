<script setup>
defineProps({
  code: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  description: { type: String, default: '' },
})

const badgeClass = (code) => `badge badge-${code.toLowerCase()}`
const barColor = (code) => {
  const map = { P1: 'var(--p1)', P2: 'var(--p2)', P3: 'var(--p3)', P4: 'var(--p4)' }
  return map[code] || 'var(--muted)'
}
const bgColor = (code) => {
  const map = { P1: 'var(--p1-bg)', P2: 'var(--p2-bg)', P3: 'var(--p3-bg)', P4: 'var(--p4-bg)' }
  return map[code] || 'var(--surface)'
}
const borderColor = (code) => {
  const map = { P1: 'var(--p1-border)', P2: 'var(--p2-border)', P3: 'var(--p3-border)', P4: 'var(--p4-border)' }
  return map[code] || 'var(--border)'
}
</script>

<template>
  <div
    class="sev-card"
    :style="{ background: bgColor(code), borderColor: borderColor(code) }"
  >
    <div class="sev-top">
      <span :class="badgeClass(code)" style="font-size:.82rem; padding:.3rem .7rem">{{ code }}</span>
      <span class="sev-count" :style="{ color: barColor(code) }">{{ value }}</span>
    </div>
    <div class="sev-label">{{ label }}</div>
    <div v-if="description" class="sev-desc">{{ description }}</div>
    <div class="sev-bar-track">
      <div
        class="sev-bar-fill"
        :style="{ width: value > 0 ? '100%' : '0%', background: barColor(code), opacity: 0.35 }"
      />
    </div>
  </div>
</template>

<style scoped>
.sev-card {
  border: 1px solid;
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
}
.sev-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.1rem;
}
.sev-count {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.sev-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}
.sev-desc {
  font-size: 0.75rem;
  color: var(--muted);
}
.sev-bar-track {
  height: 4px;
  background: rgba(0,0,0,0.06);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}
.sev-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>
