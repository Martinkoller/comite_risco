import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'dashboard',
          redirect: '/',
        },
        {
          path: 'checklist',
          name: 'checklist',
          component: () => import('@/views/ChecklistDashboard.vue'),
          meta: { title: 'CheckList de Monitoramento' },
        },
        {
          path: 'checklist/:id',
          name: 'checklist-detail',
          component: () => import('@/views/ChecklistDetail.vue'),
          meta: { title: 'Sessão de CheckList' },
        },
        {
          path: 'risk-items',
          name: 'risk-items',
          component: () => import('@/views/RiskItems.vue'),
          meta: { title: 'Itens Monitorados' },
        },
        {
          path: 'risk-items/:id',
          name: 'risk-item-detail',
          component: () => import('@/views/RiskItemDetail.vue'),
          meta: { title: 'Detalhe do Item' },
        },
        {
          path: 'management-meetings',
          name: 'management-meetings',
          component: () => import('@/views/ManagementMeetings.vue'),
          meta: { title: 'Direção / Gestão' },
        },
        {
          path: 'historico',
          name: 'historico',
          component: () => import('@/views/Historico.vue'),
          meta: { title: 'Histórico' },
        },
        {
          path: 'cadastros',
          name: 'cadastros',
          component: () => import('@/views/Cadastros.vue'),
          meta: { title: 'Cadastros' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — Comitê de Risco`
    : 'Comitê de Risco'
})

export default router
