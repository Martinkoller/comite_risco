<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  decisions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function sevClass(d) {
  const c = d.finalSeverity?.code
  return c ? `badge badge-${c.toLowerCase()}` : 'badge badge-neutral'
}

function sevCode(d) {
  return d.finalSeverity?.code || '—'
}

function goToItem(d) {
  if (d.riskItemId || d.riskItem?.id) {
    router.push(`/risk-items/${d.riskItemId || d.riskItem.id}`)
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="list-loading">Carregando decisões...</div>
    <div v-else-if="!decisions.length" class="list-empty">
      <span>Nenhuma decisão registrada ainda.</span>
    </div>
    <div v-else class="dec-list">
      <div
        v-for="d in decisions"
        :key="d.id"
        class="dec-item"
        @click="goToItem(d)"
      >
        <div class="dec-left">
          <span class="dec-code">{{ d.riskItem?.code || '—' }}</span>
          <span :class="sevClass(d)">{{ sevCode(d) }}</span>
        </div>
        <div class="dec-body">
          <div class="dec-title">{{ d.riskItem?.title || '—' }}</div>
          <div class="dec-meta">
            <span>{{ fmtDate(d.meetingDate) }}</span>
            <span v-if="d.mainResponsible">· {{ d.mainResponsible }}</span>
            <span v-if="d.goesToDirection" class="badge badge-info" style="margin-left:.35rem; font-size:.68rem">Direção</span>
          </div>
          <div v-if="d.decisionText" class="dec-text">{{ d.decisionText }}</div>
        </div>
        <div class="dec-status">
          <span class="badge badge-neutral">{{ d.committeeStatus?.name || '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-loading,
.list-empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.875rem;
}
.dec-list {
  display: grid;
  gap: 0;
}
.dec-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
}
.dec-item:last-child {
  border-bottom: none;
}
.dec-item:hover {
  background: var(--bg);
  margin-inline: -0.5rem;
  padding-inline: 0.5rem;
  border-radius: 6px;
}
.dec-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  min-width: 52px;
}
.dec-code {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}
.dec-body {
  flex: 1;
  min-width: 0;
}
.dec-title {
  font-size: 0.875rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dec-meta {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.2rem;
}
.dec-text {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dec-status {
  flex-shrink: 0;
}
</style>
