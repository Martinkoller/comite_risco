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

function daysOverdue(d) {
  if (!d) return 0
  return Math.max(0, Math.ceil((new Date() - new Date(d)) / 86400000))
}

function goToItem(item) {
  const id = item.riskItemId || item.riskItem?.id
  if (id) router.push(`/risk-items/${id}`)
}

function itemCode(item) {
  return item.riskItem?.code || item.code || '—'
}

function itemTitle(item) {
  return item.theme || item.riskItem?.title || item.title || '—'
}
</script>

<template>
  <div>
    <div v-if="loading" class="list-loading">Carregando ações em atraso...</div>
    <div v-else-if="!items.length" class="list-empty">
      <span style="font-size:1.5rem">🎉</span>
      <p>Sem ações em atraso!</p>
    </div>
    <div v-else class="da-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="da-item"
        @click="goToItem(item)"
      >
        <div class="da-overdue">
          <span>-{{ daysOverdue(item.deadline) }}d</span>
        </div>
        <div class="da-body">
          <div class="da-top">
            <span class="da-code">{{ itemCode(item) }}</span>
            <span v-if="item.code" class="da-pa-code">{{ item.code }}</span>
          </div>
          <div class="da-title">{{ itemTitle(item) }}</div>
          <div class="da-meta">
            <span>Venceu {{ fmtDate(item.deadline) }}</span>
            <span v-if="item.responsibleName">· {{ item.responsibleName }}</span>
            <span v-if="item.responsibleArea">· {{ item.responsibleArea }}</span>
          </div>
        </div>
        <div class="da-status">
          <span class="badge badge-danger">{{ item.actionStatus?.name || 'Em atraso' }}</span>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.da-list {
  display: grid;
  gap: 0;
}
.da-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  border-left: 3px solid var(--danger);
  padding-left: 0.65rem;
  transition: background 0.1s;
}
.da-item:last-child { border-bottom: none; }
.da-item:hover {
  background: var(--p1-bg);
}
.da-overdue {
  flex-shrink: 0;
  min-width: 40px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--danger);
  padding-top: 0.1rem;
}
.da-body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}
.da-top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.da-code {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary);
}
.da-pa-code {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--muted);
  background: var(--border);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}
.da-title {
  font-size: 0.85rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.da-meta {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.da-status {
  flex-shrink: 0;
}
</style>
