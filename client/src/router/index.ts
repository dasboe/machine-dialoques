import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Machine Dialogues' }
  },
  {
    path: '/dialogues',
    name: 'Dialogues',
    component: () => import('@/views/DialoguesView.vue'),
    meta: { title: 'Dialogues' }
  },
  {
    path: '/dialogues/:id',
    name: 'DialogueDetail',
    component: () => import('@/views/DialogueDetailView.vue'),
    meta: { title: 'Dialogue Detail' }
  },
  {
    path: '/questions',
    name: 'Questions',
    component: () => import('@/views/QuestionsView.vue'),
    meta: { title: 'Questions' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { title: 'Analytics' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'About' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title on route change
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | Machine Dialogues` : 'Machine Dialogues'
})

export default router