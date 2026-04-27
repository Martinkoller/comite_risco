<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
const sidebarOpen = ref(false)

const theme = ref('light')
onMounted(() => {
  const saved = localStorage.getItem('theme')
  theme.value =
    saved ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', theme.value)
})
watch(theme, (t) => {
  localStorage.setItem('theme', t)
  document.documentElement.setAttribute('data-theme', t)
})
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const navItems = [
  { path: '/',                   label: 'Dashboard',          icon: '📊' },
  { path: '/checklist',          label: 'CheckList',          icon: '☑️' },
  { path: '/risk-items',         label: 'Itens Monitorados',  icon: '🔍' },
  { path: '/po-analysis',        label: 'Análises dos POs',   icon: '📝', disabled: true },
  { path: '/committee-decisions',label: 'Decisões do Comitê', icon: '⚖️',  disabled: true },
  { path: '/action-plans',       label: 'Planos de Ação',     icon: '🎯',  disabled: true },
  { path: '/management-meetings',label: 'Direção / Gestão',   icon: '🤝' },
  { path: '/historico',          label: 'Histórico',          icon: '📁' },
  { path: '/cadastros',          label: 'Cadastros',          icon: '⚙️' },
]
</script>

<template>
  <div class="shell" :class="{ 'sidebar-mobile-open': sidebarOpen }">

    <!-- ── Sidebar ─────────────────────────────────────── -->
    <aside class="sidebar">
      <div class="sidebar-inner">

        <!-- Brand -->
        <RouterLink to="/" class="sidebar-brand" @click="sidebarOpen = false">
          <span class="sidebar-brand-icon">⚠️</span>
          <div class="sidebar-brand-text">
            <span class="sidebar-brand-name">Comitê de Risco</span>
            <span class="sidebar-brand-sub">BU POS · Zucchetti</span>
          </div>
        </RouterLink>

        <!-- Nav -->
        <nav class="sidebar-nav">
          <template v-for="item in navItems" :key="item.path">
            <span
              v-if="item.disabled"
              class="sidebar-nav-item disabled"
              :title="`${item.label} — em breve`"
            >
              <span class="sidebar-nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              <span class="sidebar-nav-soon">em breve</span>
            </span>
            <RouterLink
              v-else
              :to="item.path"
              class="sidebar-nav-item"
              :class="{ active: route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path)) }"
              @click="sidebarOpen = false"
            >
              <span class="sidebar-nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </template>
        </nav>

        <!-- Footer info -->
        <div class="sidebar-footer">
          <div class="sidebar-ritual">
            <div class="sidebar-ritual-title">Ritual do Comitê</div>
            <div class="sidebar-ritual-item">
              <span class="sidebar-ritual-dot"></span>Terça · 08:00 — Triagem
            </div>
            <div class="sidebar-ritual-item">
              <span class="sidebar-ritual-dot"></span>Quinta manhã — Análise
            </div>
            <div class="sidebar-ritual-item">
              <span class="sidebar-ritual-dot"></span>Quinta tarde — Decisão
            </div>
          </div>
          <div class="sidebar-people">
            <div class="sidebar-person">
              <span class="sidebar-person-role">Governança</span>
              <span class="sidebar-person-name">Mártin Marcelo Koller</span>
            </div>
            <div class="sidebar-person">
              <span class="sidebar-person-role">Diretor</span>
              <span class="sidebar-person-name">Marcelo Stivanello</span>
            </div>
          </div>
          <button
            class="sidebar-theme-btn"
            @click="toggleTheme"
            :aria-label="theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'"
          >
            <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            {{ theme === 'light' ? 'Modo Escuro' : 'Modo Claro' }}
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Overlay mobile ──────────────────────────────── -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <!-- ── Main area ───────────────────────────────────── -->
    <div class="main-area">

      <!-- Mobile topbar (só em mobile) -->
      <div class="mobile-bar">
        <button class="mobile-menu-btn" @click="sidebarOpen = !sidebarOpen" :aria-expanded="sidebarOpen">
          <svg v-if="!sidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="mobile-bar-title">Comitê de Risco · BU POS</span>
      </div>

      <main class="main-content">
        <RouterView />
      </main>

    </div>

    <ToastContainer />
  </div>
</template>

<style scoped>
/* ── Shell ──────────────────────────────────────── */
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ── Sidebar ──────────────────────────────────── */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--header-bg);
  color: var(--header-fg);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 20;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.sidebar-inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1.1rem 1rem 1rem;
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.sidebar-brand-icon {
  width: 34px;
  height: 34px;
  background: var(--primary);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.sidebar-brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sidebar-brand-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}
.sidebar-brand-sub {
  font-size: 0.68rem;
  color: #94a3b8;
  white-space: nowrap;
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.75rem 0.5rem;
  flex: 1;
}
.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}
.sidebar-nav-item:hover:not(.disabled) {
  color: #fff;
  background: rgba(255,255,255,0.07);
}
.sidebar-nav-item.active {
  color: #fff;
  background: rgba(37,99,235,0.35);
}
.sidebar-nav-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
.sidebar-nav-icon {
  font-size: 0.95rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}
.sidebar-nav-soon {
  font-size: 0.62rem;
  background: rgba(255,255,255,0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  margin-left: auto;
  color: #64748b;
}

/* Footer */
.sidebar-footer {
  padding: 0.75rem 0.75rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex-shrink: 0;
}
.sidebar-ritual {
  display: grid;
  gap: 0.25rem;
}
.sidebar-ritual-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 0.1rem;
}
.sidebar-ritual-item {
  font-size: 0.72rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.sidebar-ritual-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}
.sidebar-people {
  display: grid;
  gap: 0.35rem;
}
.sidebar-person {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.sidebar-person-role {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}
.sidebar-person-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #e2e8f0;
}
.sidebar-theme-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  color: #94a3b8;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  justify-content: center;
}
.sidebar-theme-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

/* ── Main area ─────────────────────────────────── */
.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  padding: 0 1.5rem;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
}

/* ── Mobile bar ────────────────────────────────── */
.mobile-bar {
  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--header-bg);
  color: var(--header-fg);
  position: sticky;
  top: 0;
  z-index: 15;
}
.mobile-menu-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #e5e7eb;
  cursor: pointer;
  padding: 0.3rem;
  display: flex;
  align-items: center;
}
.mobile-bar-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
}

/* ── Mobile overlay ────────────────────────────── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 19;
  backdrop-filter: blur(1px);
}

/* ── Responsive ────────────────────────────────── */
@media (max-width: 860px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 20;
  }
  .sidebar-mobile-open .sidebar {
    transform: translateX(0);
  }
  .sidebar-mobile-open .sidebar-overlay {
    display: block;
  }
  .mobile-bar {
    display: flex;
  }
  .main-content {
    padding: 0 1rem;
  }
}
</style>
