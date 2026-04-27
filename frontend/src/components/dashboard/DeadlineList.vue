<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function daysLeft(d) {
  if (!d) return null
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000)
  return diff
}

function urgencyClass(d) {
  const n = daysLeft(d)
  if (n === null) return ''
  if (n <= 1) return 'urgent'
  if (n <= 3) return 'soon'
  return ''
}

function urgencyLabel(d) {
  const n = daysLeft(d)
  if (n === null) return ''
  if (n === 0) return 'Hoje'
  if (n === 1) return 'Amanhã'
  if (n < 0) return 'Vencido'
  return `${n}d`
}

function goToItem(item) {
  const id = item.riskItemId || item.riskItem?.id
  if (id) router.push(`/risk-items/${id}`)
}

function itemCode(item) {
  return item.riskItem?.code || item.code || '—'
}

function itemTitle(item) {
  return item.riskItem?.title || item.theme || item.title || '—'
}
</script>

<template>
  <div>
    <div v-if="loading" class="list-loading">Carregando prazos...</div>
    <div v-else-if="!items.length" class="list-empty">
      <span>Nenhum prazo nos próximos 7 dias.</span>
    </div>
    <div v-else class="dl-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="dl-item"
        :class="urgencyClass(item.deadline)"
        @click="goToItem(item)"
      >
        <div class="dl-badge-wrap">
          <span class="dl-days" :class="urgencyClass(item.deadline)">
            {{ urgencyLabel(item.deadline) }}
          </span>
        </div>
        <div class="dl-body">
          <span class="dl-code">{{ itemCode(item) }}</span>
          <span class="dl-title">{{ itemTitle(item) }}</span>
          <div class="dl-meta">
            <span>Prazo: {{ fmtDate(item.deadline) }}</span>
            <span v-if="item.responsibleName">· {{ item.responsibleName }}</span>
            <span v-if="item.actionStatus?.name" class="badge badge-neutral" style="font-size:.68rem">{{ item.actionStatus.name }}</span>
          </div>
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
.dl-list {
  display: grid;
  gap: 0;
}
.dl-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
}
.dl-item:last-child { border-bottom: none; }
.dl-item:hover {
  background: var(--bg);
  margin-inline: -0.5rem;
  padding-inline: 0.5rem;
  border-radius: 6px;
}
.dl-item.urgent { border-left: 3px solid var(--danger); padding-left: 0.65rem; }
.dl-item.soon { border-left: 3px solid var(--warning); padding-left: 0.65rem; }
.dl-badge-wrap {
  flex-shrink: 0;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dl-days {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  background: var(--border);
  color: var(--muted);
  white-space: nowrap;
}
.dl-days.urgent { background: var(--p1-bg); color: var(--p1); border: 1px solid var(--p1-border); }
.dl-days.soon { background: var(--p2-bg); color: var(--p2); border: 1px solid var(--p2-border); }
.dl-body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}
.dl-code {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary);
}
.dl-title {
  font-size: 0.85rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dl-meta {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
}
</style>
