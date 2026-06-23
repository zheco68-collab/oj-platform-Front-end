import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/problem',
    name: 'problem-list',
    component: () => import('../views/ProblemListView.vue'),
  },
  {
    path: '/problem/:id(\\d+)',
    name: 'problem-detail',
    component: () => import('../views/ProblemDetailView.vue'),
  },
  {
    path: '/problem/:id(\\d+)/solution',
    name: 'solution-list',
    component: () => import('../views/SolutionListView.vue'),
  },
  {
    path: '/solution',
    name: 'solution-plaza',
    component: () => import('../views/SolutionPlazaView.vue'),
  },
  {
    path: '/solution/:id(\\d+)',
    name: 'solution-detail',
    component: () => import('../views/SolutionDetailView.vue'),
  },
  {
    path: '/contest',
    name: 'contest-list',
    component: () => import('../views/ContestListView.vue'),
  },
  {
    path: '/contest/:id(\\d+)',
    name: 'contest-detail',
    component: () => import('../views/ContestDetailView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/user/:id(\\d+)',
    name: 'user-profile',
    component: () => import('../views/UserProfileView.vue'),
  },
  {
    path: '/announcement/:id(\\d+)',
    name: 'announcement-detail',
    component: () => import('../views/AnnouncementDetailView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/problems',
    name: 'admin-problems',
    component: () => import('../views/admin/AdminProblemManager.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/contests',
    name: 'admin-contests',
    component: () => import('../views/admin/AdminContestManager.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/announcements',
    name: 'admin-announcements',
    component: () => import('../views/admin/AdminAnnouncementManager.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../views/admin/AdminUserManager.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 导航后滚动到顶部
    return { top: 0 }
  },
})

// 全局路由守卫：管理员权限校验
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAdmin) {
    // 注意：Pinia store 必须在 app.use(pinia) 之后才能使用
    // 这里通过 getActivePinia 获取已激活的 store 实例
    const auth = useAuthStore()
    if (!auth.isAdmin) {
      // 非管理员重定向到首页
      next({ name: 'home' })
      return
    }
  }
  next()
})

export default router
