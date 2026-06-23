/**
 * ContestListView 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import ContestListView from '../ContestListView.vue'
import { createTestPinia, createTestRouter, mountWithPlugins } from '../../test/helpers'

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

const mockContestsData = [
  {
    id: 1,
    name: '夏季算法竞赛',
    category: 'OFFICIAL' as const,
    type: 'IOI' as const,
    status: 'UPCOMING' as const,
    rated: true,
    startTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    organizer: 'OJ 官方',
  },
  {
    id: 2,
    name: '周赛 #56 — DP专场',
    category: 'PUBLIC' as const,
    type: 'ICPC' as const,
    status: 'UPCOMING' as const,
    rated: true,
    startTime: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
    organizer: 'Admin',
  },
  {
    id: 3,
    name: '周赛 #55 — 图论',
    category: 'PUBLIC' as const,
    type: 'ICPC' as const,
    status: 'RUNNING' as const,
    rated: true,
    startTime: new Date(Date.now() - 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    organizer: 'Admin',
  },
  {
    id: 4,
    name: '新手练习赛 #12',
    category: 'TEAM' as const,
    type: 'OI' as const,
    status: 'ENDED' as const,
    rated: false,
    startTime: '2026-06-15T10:00:00Z',
    endTime: '2026-06-16T10:00:00Z',
    organizer: 'OJ 训练营',
  },
  {
    id: 5,
    name: '月赛 #5 — 算法综合',
    category: 'OFFICIAL' as const,
    type: 'IOI' as const,
    status: 'ENDED' as const,
    rated: true,
    startTime: '2026-06-01T09:00:00Z',
    endTime: '2026-06-01T15:00:00Z',
    organizer: 'OJ 官方',
  },
]

// Mock contests API
vi.mock('../../api/contests', () => ({
  fetchContests: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { data: mockContestsData, total: mockContestsData.length, page: 1, size: 12 },
    }),
  ),
}))

// ==================== 辅助函数 ====================

function mountContestListView() {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/contest', name: 'contest-list', component: ContestListView },
    { path: '/contest/:id', name: 'contest-detail', component: { template: '<div/>' } },
  ])
  return mountWithPlugins(ContestListView, { router, pinia })
}

// ==================== 测试 ====================

describe('ContestListView', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染页面标题', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.find('.page-header h1').text()).toBe('比赛')
    })

    it('应该渲染Tab切换栏', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('全部')
      expect(wrapper.text()).toContain('进行中')
      expect(wrapper.text()).toContain('即将开始')
      expect(wrapper.text()).toContain('已结束')
    })

    it('应该渲染比赛卡片网格', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.find('.contest-grid').exists()).toBe(true)
    })
  })

  describe('比赛卡片内容', () => {
    it('比赛卡片数量正确', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      const cards = wrapper.findAll('.contest-card')
      expect(cards.length).toBe(5)
    })

    it('卡片显示比赛名称', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('夏季算法竞赛')
      expect(wrapper.text()).toContain('周赛 #56 — DP专场')
      expect(wrapper.text()).toContain('周赛 #55 — 图论')
      expect(wrapper.text()).toContain('新手练习赛 #12')
      expect(wrapper.text()).toContain('月赛 #5 — 算法综合')
    })

    it('卡片显示类型标签', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('官方比赛')
      expect(wrapper.text()).toContain('公开赛')
      expect(wrapper.text()).toContain('团队赛')
    })

    it('卡片显示赛制标签', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('IOI')
      expect(wrapper.text()).toContain('ICPC')
      expect(wrapper.text()).toContain('OI')
    })

    it('Rated比赛显示Rated标签', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      // 应该有 Rated 标签出现在前3场和最后一场比赛中
      expect(wrapper.html()).toContain('Rated')
    })

    it('卡片显示比赛状态', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('未开始')
      expect(wrapper.text()).toContain('进行中')
      expect(wrapper.text()).toContain('已结束')
    })

    it('卡片显示比赛时间', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('开始：')
      expect(wrapper.text()).toContain('结束：')
    })

    it('未开始比赛显示倒计时', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('距开始：')
    })

    it('进行中比赛显示距结束倒计时', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('距结束：')
    })

    it('卡片显示主办方', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('主办方：OJ 官方')
      expect(wrapper.text()).toContain('主办方：Admin')
      expect(wrapper.text()).toContain('主办方：OJ 训练营')
    })
  })

  describe('点击跳转', () => {
    it('点击比赛卡片跳转到比赛详情', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      const cards = wrapper.findAll('.contest-card')
      if (cards.length > 0) {
        await cards[0].trigger('click')
        await flushPromises()
        const currentRoute = wrapper.vm.$router.currentRoute.value
        expect(currentRoute.name).toBe('contest-detail')
      }
    })
  })

  describe('Tab 筛选', () => {
    it('默认为"全部"Tab', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      const cards = wrapper.findAll('.contest-card')
      expect(cards.length).toBe(5)
    })

    it('切换到"进行中"只显示RUNNING比赛', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      // 找到"进行中"tab并点击
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const runningTab = tabPanes.find((t) => t.props('tab') === '进行中')
      if (runningTab) {
        await runningTab.trigger('click')
        await wrapper.vm.$nextTick()
        const cards = wrapper.findAll('.contest-card')
        expect(cards.length).toBe(1)
        expect(cards[0].text()).toContain('周赛 #55')
      }
    })

    it('切换到"即将开始"只显示UPCOMING比赛', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const upcomingTab = tabPanes.find((t) => t.props('tab') === '即将开始')
      if (upcomingTab) {
        await upcomingTab.trigger('click')
        await wrapper.vm.$nextTick()
        const cards = wrapper.findAll('.contest-card')
        expect(cards.length).toBe(2)
        cards.forEach((card) => {
          expect(card.text()).toContain('未开始')
        })
      }
    })

    it('切换到"已结束"只显示ENDED比赛', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const endedTab = tabPanes.find((t) => t.props('tab') === '已结束')
      if (endedTab) {
        await endedTab.trigger('click')
        await wrapper.vm.$nextTick()
        const cards = wrapper.findAll('.contest-card')
        expect(cards.length).toBe(2)
        cards.forEach((card) => {
          expect(card.text()).toContain('已结束')
        })
      }
    })
  })

  describe('空状态', () => {
    it('无数据时显示空状态占位', async () => {
      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContests).mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: { data: [], total: 0, page: 1, size: 12 },
      })
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.text()).toContain('暂无比赛')
    })
  })

  describe('错误处理', () => {
    it('API失败时不崩溃', async () => {
      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContests).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.find('.contest-list-page').exists()).toBe(true)
    })
  })

  describe('分页', () => {
    it('数据少于pageSize时不显示分页器', async () => {
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.find('.pagination-wrapper').exists()).toBe(false)
    })

    it('数据多于pageSize时显示分页器', async () => {
      // 生成14条数据（pageSize=12）
      const manyContests = Array.from({ length: 14 }, (_, i) => ({
        id: i + 1,
        name: `测试比赛 ${i + 1}`,
        category: 'PUBLIC' as const,
        type: 'ICPC' as const,
        status: 'ENDED' as const,
        rated: false,
        startTime: `2026-06-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        endTime: `2026-06-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
        organizer: 'Test',
      }))

      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContests).mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: { data: manyContests, total: manyContests.length, page: 1, size: 12 },
      })
      const wrapper = mountContestListView()
      await flushPromises()
      expect(wrapper.find('.pagination-wrapper').exists()).toBe(true)
    })
  })
})
