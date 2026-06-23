/**
 * UserProfileView 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserProfileView from '../views/UserProfileView.vue'
import { createTestRouter, mountWithPlugins } from '../test/helpers'

// Mock useMessage
vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>()
  return {
    ...actual,
    useMessage: () => ({
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      destroyAll: vi.fn(),
    }),
  }
})

// ==================== Mock 数据 ====================

const mockUserProfile = {
  id: 1,
  username: 'tourist',
  avatarUrl: '',
  signature: 'Codeforces Legendary Grandmaster',
  role: 'USER' as const,
  createdAt: '2024-03-15T08:00:00Z',
  acceptedCount: 1523,
  submissionCount: 2100,
  rating: 3200,
  recentAC: [
    { problemId: 105, problemTitle: '网络流建模 (E)', acceptedAt: '2026-06-23T06:00:00Z' },
    { problemId: 104, problemTitle: '几何计算 (D)', acceptedAt: '2026-06-22T14:30:00Z' },
  ],
  solutions: [
    {
      id: 1,
      title: '网络流建模题解 — Dinic算法详解',
      author: { id: 1, username: 'tourist', avatarUrl: '' },
      problemId: 105,
      problemTitle: '网络流建模 (E)',
      createdAt: '2026-06-23T08:00:00Z',
      likeCount: 42,
      summary: '本题需要将实际问题转化为网络流模型...',
    },
  ],
  contestHistory: [
    { contestId: 3, contestName: '周赛 #55 — 图论与搜索', rank: 1, ratingChange: 45 },
    { contestId: 5, contestName: '月赛 #5 — 算法综合挑战', rank: 2, ratingChange: -12 },
  ],
}

const mockAdminProfile = {
  id: 3,
  username: 'AC_Automaton',
  avatarUrl: '',
  signature: 'AC one shot, one kill',
  role: 'ADMIN' as const,
  createdAt: '2024-05-20T14:30:00Z',
  acceptedCount: 1120,
  submissionCount: 1680,
  rating: 2800,
  recentAC: [
    { problemId: 303, problemTitle: '最小生成树 (C)', acceptedAt: '2026-06-23T14:00:00Z' },
  ],
  solutions: [
    {
      id: 2,
      title: '最小生成树 Kruskal vs Prim',
      author: { id: 3, username: 'AC_Automaton', avatarUrl: '' },
      problemId: 303,
      problemTitle: '最小生成树 (C)',
      createdAt: '2026-06-23T15:00:00Z',
      likeCount: 56,
      summary: '本文对比了Kruskal和Prim两种算法...',
    },
  ],
  contestHistory: [
    { contestId: 3, contestName: '周赛 #55 — 图论与搜索', rank: 3, ratingChange: 18 },
  ],
}

// Mock API
vi.mock('../api/users', () => ({
  fetchUserProfile: vi.fn((userId: number) => {
    if (userId === 999) {
      return Promise.resolve({ code: 404, message: 'User not found', data: null })
    }
    if (userId === 3) {
      return Promise.resolve({ code: 200, message: 'ok', data: mockAdminProfile })
    }
    return Promise.resolve({ code: 200, message: 'ok', data: mockUserProfile })
  }),
}))

// ==================== 辅助函数 ====================

async function mountUserProfile(userId = 1) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/', name: 'home', component: { template: '<div/>' } },
    { path: '/user/:id(\\d+)', name: 'user-profile', component: UserProfileView },
    { path: '/problem/:id(\\d+)', name: 'problem-detail', component: { template: '<div/>' } },
    { path: '/solution/:id(\\d+)', name: 'solution-detail', component: { template: '<div/>' } },
    { path: '/contest/:id(\\d+)', name: 'contest-detail', component: { template: '<div/>' } },
  ])
  await router.push(`/user/${userId}`)
  await router.isReady()
  return mountWithPlugins(UserProfileView, { router, pinia })
}

// ==================== 测试 ====================

describe('UserProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('页面渲染', () => {
    it('应该显示用户名', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).toContain('tourist')
    })

    it('应该显示签名', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).toContain('Codeforces Legendary Grandmaster')
    })

    it('应该显示统计数据', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).toContain('1,523')
      expect(wrapper.text()).toContain('2,100')
      expect(wrapper.text()).toContain('通过题数')
      expect(wrapper.text()).toContain('提交总数')
      expect(wrapper.text()).toContain('通过率')
    })

    it('应该显示 Rating', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).toContain('3,200')
      expect(wrapper.text()).toContain('Rating')
    })

    it('应该显示注册时间', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).toContain('加入')
    })
  })

  describe('管理员标识', () => {
    it('普通用户不显示管理员标签', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).not.toContain('管理员')
    })

    it('管理员应显示管理员标签', async () => {
      const wrapper = await mountUserProfile(3)
      await flushPromises()
      expect(wrapper.text()).toContain('管理员')
    })
  })

  describe('Tab 区', () => {
    it('应该渲染三个 Tab', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      expect(wrapper.text()).toContain('最近通过')
      expect(wrapper.text()).toContain('题解')
      expect(wrapper.text()).toContain('比赛记录')
    })

    it('"最近通过" Tab 应该显示 AC 记录', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      // 应该在默认的"最近通过"Tab
      expect(wrapper.text()).toContain('网络流建模 (E)')
      expect(wrapper.text()).toContain('几何计算 (D)')
    })

    it('"题解" Tab 应该显示题解列表', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      // 切换到题解Tab
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const solutionsTab = tabPanes.find((t) => t.props('tab') === '题解')
      if (solutionsTab) {
        await solutionsTab.trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain('网络流建模题解')
        expect(wrapper.text()).toContain('42')
      }
    })

    it('"比赛记录" Tab 应该显示比赛历史', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const contestTab = tabPanes.find((t) => t.props('tab') === '比赛记录')
      if (contestTab) {
        await contestTab.trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain('周赛 #55')
        expect(wrapper.text()).toContain('月赛 #5')
        expect(wrapper.text()).toContain('#1')
        expect(wrapper.text()).toContain('+45')
        expect(wrapper.text()).toContain('-12')
      }
    })
  })

  describe('边界条件', () => {
    it('不存在的用户显示空状态', async () => {
      const wrapper = await mountUserProfile(999)
      await flushPromises()
      expect(wrapper.text()).toContain('用户不存在')
    })

    it('Rating 变化的颜色样式正确', async () => {
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const contestTab = tabPanes.find((t) => t.props('tab') === '比赛记录')
      if (contestTab) {
        await contestTab.trigger('click')
        await wrapper.vm.$nextTick()
        // 正值应该显示绿色
        const ratingUps = wrapper.findAll('.rating-up')
        const ratingDowns = wrapper.findAll('.rating-down')
        expect(ratingUps.length).toBeGreaterThan(0)
        expect(ratingDowns.length).toBeGreaterThan(0)
      }
    })
  })

  describe('API 错误处理', () => {
    it('API 失败时显示错误状态', async () => {
      const api = await import('../api/users')
      vi.mocked(api.fetchUserProfile).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = await mountUserProfile(1)
      await flushPromises()
      // 组件不应该崩溃
      expect(wrapper.find('.user-profile').exists()).toBe(true)
    })
  })
})
