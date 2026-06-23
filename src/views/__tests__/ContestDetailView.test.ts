/**
 * ContestDetailView 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import ContestDetailView from '../ContestDetailView.vue'
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

const mockContestDetail = {
  id: 3,
  name: '周赛 #55 — 图论与搜索',
  category: 'PUBLIC' as const,
  type: 'ICPC' as const,
  status: 'RUNNING' as const,
  rated: true,
  startTime: new Date(Date.now() - 3600 * 1000).toISOString(),
  endTime: new Date(Date.now() + 3600 * 1000).toISOString(),
  organizer: 'Admin',
  description: '# 比赛规则\n\n## 赛制\nICPC 赛制，通过全部测试数据得分。',
  problems: [
    { id: 301, order: 1, title: 'A. 迷宫最短路径', difficulty: 'entry' as const, acceptedCount: 156, submissionCount: 234 },
    { id: 302, order: 2, title: 'B. 拓扑排序', difficulty: 'popularize' as const, acceptedCount: 89, submissionCount: 178 },
    { id: 303, order: 3, title: 'C. 最小生成树', difficulty: 'improve' as const, acceptedCount: 42, submissionCount: 120 },
    { id: 304, order: 4, title: 'D. 网络流', difficulty: 'provincial' as const, acceptedCount: 8, submissionCount: 56 },
  ],
  ranking: [
    { rank: 1, userId: 1, username: 'tourist', scores: [100, 100, 100, 100], totalScore: 400, penalty: 45 },
    { rank: 2, userId: 2, username: 'Petr', scores: [100, 100, 100, 75], totalScore: 375, penalty: 62 },
    { rank: 3, userId: 3, username: 'AC_Automaton', scores: [100, 100, 100, 50], totalScore: 350, penalty: 58 },
    { rank: 4, userId: 4, username: 'CodeMaster', scores: [100, 100, 100, 0], totalScore: 300, penalty: 40 },
  ],
}

const mockContestProblems = mockContestDetail.problems
const mockContestRanking = mockContestDetail.ranking
const mockContestSubmissions = [
  { id: 'CS-000001', problemId: 301, language: 'C++17', code: '// @judge: AC', status: 'AC' as const, time: 12, memory: 2560, createdAt: '2026-06-23T13:15:00Z' },
  { id: 'CS-000002', problemId: 302, language: 'C++20', code: '// @judge: AC', status: 'AC' as const, time: 8, memory: 1024, createdAt: '2026-06-23T13:30:00Z' },
  { id: 'CS-000003', problemId: 303, language: 'C++17', code: '// @judge: WA', status: 'WA' as const, time: 45, memory: 4096, createdAt: '2026-06-23T13:50:00Z' },
]

// Mock contests API
vi.mock('../../api/contests', () => ({
  fetchContestDetail: vi.fn((id: number) => {
    if (id === 3) {
      return Promise.resolve({ code: 200, message: 'ok', data: mockContestDetail })
    }
    return Promise.resolve({ code: 404, message: 'not found', data: null })
  }),
  fetchContestProblems: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: mockContestProblems }),
  ),
  fetchContestRanking: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: mockContestRanking }),
  ),
  fetchContestSubmissions: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: mockContestSubmissions }),
  ),
}))

// ==================== 辅助函数 ====================

async function mountContestDetailView(contestId = 3) {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/contest/:id', name: 'contest-detail', component: ContestDetailView },
    { path: '/contest', name: 'contest-list', component: { template: '<div/>' } },
    { path: '/problem/:id', name: 'problem-detail', component: { template: '<div/>' } },
  ])
  await router.push(`/contest/${contestId}`)
  return mountWithPlugins(ContestDetailView, { router, pinia })
}

// ==================== 测试 ====================

describe('ContestDetailView', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  describe('比赛头部', () => {
    it('应该渲染比赛名称', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-title').text()).toBe('周赛 #55 — 图论与搜索')
    })

    it('应该渲染比赛类型标签', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-meta').text()).toContain('公开赛')
    })

    it('应该渲染赛制标签', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-meta').text()).toContain('ICPC')
    })

    it('Rated比赛显示Rated标签', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-meta').text()).toContain('Rated')
    })

    it('应该渲染状态标签', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-meta').text()).toContain('进行中')
    })

    it('应该显示开始时间', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.text()).toContain('开始时间：')
    })

    it('应该显示结束时间', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.text()).toContain('结束时间：')
    })

    it('应该显示主办方', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.text()).toContain('Admin')
    })
  })

  describe('倒计时', () => {
    it('进行中的比赛显示距结束倒计时', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-countdown-box').exists()).toBe(true)
      expect(wrapper.text()).toContain('距结束')
    })

    it('未开始的比赛显示距开始倒计时', async () => {
      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContestDetail).mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: {
          ...mockContestDetail,
          status: 'UPCOMING' as const,
          startTime: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
          endTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        },
      })
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.text()).toContain('距开始')
    })

    it('已结束的比赛不显示倒计时', async () => {
      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContestDetail).mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: {
          ...mockContestDetail,
          status: 'ENDED' as const,
          startTime: '2026-06-01T09:00:00Z',
          endTime: '2026-06-01T15:00:00Z',
        },
      })
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-countdown-box').exists()).toBe(false)
    })
  })

  describe('Tab 切换', () => {
    it('应该渲染4个Tab', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.text()).toContain('题目列表')
      expect(wrapper.text()).toContain('排名')
      expect(wrapper.text()).toContain('规则')
      expect(wrapper.text()).toContain('我的提交')
    })

    it('默认显示题目列表Tab', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      // 应包含NDataTable
      expect(wrapper.find('.contest-tabs').exists()).toBe(true)
    })

    it('切换到排名Tab加载排名数据', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rankingTab = tabPanes.find((t) => t.props('tab') === '排名')
      if (rankingTab) {
        await rankingTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('tourist')
      }
    })

    it('切换到规则Tab显示Markdown内容', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rulesTab = tabPanes.find((t) => t.props('tab') === '规则')
      if (rulesTab) {
        await rulesTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('比赛规则')
      }
    })
  })

  describe('题目列表Tab', () => {
    it('显示所有题目', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      // 加载题目
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const problemsTab = tabPanes.find((t) => t.props('tab') === '题目列表')
      if (problemsTab) {
        await problemsTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('A. 迷宫最短路径')
        expect(wrapper.html()).toContain('B. 拓扑排序')
        expect(wrapper.html()).toContain('C. 最小生成树')
        expect(wrapper.html()).toContain('D. 网络流')
      }
    })

    it('进行中的比赛隐藏通过率详细数字', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      // 通过率应该被隐藏 (显示 —)
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const problemsTab = tabPanes.find((t) => t.props('tab') === '题目列表')
      if (problemsTab) {
        await problemsTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        // RUNNING状态下通过率应显示 "—"
        expect(wrapper.html()).toContain('—')
      }
    })

    it('已结束的比赛显示通过率', async () => {
      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContestDetail).mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: {
          ...mockContestDetail,
          status: 'ENDED' as const,
        },
      })
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const problemsTab = tabPanes.find((t) => t.props('tab') === '题目列表')
      if (problemsTab) {
        await problemsTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        // ENDED状态下应显示具体通过率数字
        expect(wrapper.html()).toContain('156')
        expect(wrapper.html()).toContain('234')
      }
    })
  })

  describe('排名Tab', () => {
    it('显示排名表格', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rankingTab = tabPanes.find((t) => t.props('tab') === '排名')
      if (rankingTab) {
        await rankingTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('tourist')
        expect(wrapper.html()).toContain('Petr')
        expect(wrapper.html()).toContain('AC_Automaton')
        expect(wrapper.html()).toContain('CodeMaster')
        expect(wrapper.html()).toContain('400')
        expect(wrapper.html()).toContain('375')
      }
    })

    it('前三名显示奖牌图标', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rankingTab = tabPanes.find((t) => t.props('tab') === '排名')
      if (rankingTab) {
        await rankingTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        // 前三名应该显示奖牌图标（rank-medal 样式类）
        const medals = wrapper.findAll('.rank-medal')
        expect(medals.length).greaterThanOrEqual(3)
        expect(wrapper.find('.rank-gold').exists()).toBe(true)
        expect(wrapper.find('.rank-silver').exists()).toBe(true)
        expect(wrapper.find('.rank-bronze').exists()).toBe(true)
      }
    })

    it('ICPC赛制显示罚时列', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rankingTab = tabPanes.find((t) => t.props('tab') === '排名')
      if (rankingTab) {
        await rankingTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('罚时')
        expect(wrapper.html()).toContain('45 min')
        expect(wrapper.html()).toContain('62 min')
      }
    })
  })

  describe('规则Tab', () => {
    it('渲染Markdown规则内容', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rulesTab = tabPanes.find((t) => t.props('tab') === '规则')
      if (rulesTab) {
        await rulesTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.find('.rules-content').exists()).toBe(true)
        expect(wrapper.html()).toContain('ICPC 赛制')
      }
    })
  })

  describe('我的提交Tab', () => {
    it('显示提交记录', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const submissionsTab = tabPanes.find((t) => t.props('tab') === '我的提交')
      if (submissionsTab) {
        await submissionsTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('CS-000001')
        expect(wrapper.html()).toContain('CS-000002')
        expect(wrapper.html()).toContain('CS-000003')
        expect(wrapper.html()).toContain('C++17')
      }
    })

    it('显示判题状态标签', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const submissionsTab = tabPanes.find((t) => t.props('tab') === '我的提交')
      if (submissionsTab) {
        await submissionsTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
        expect(wrapper.html()).toContain('AC')
        expect(wrapper.html()).toContain('WA')
      }
    })
  })

  describe('错误处理', () => {
    it('比赛不存在时显示空状态', async () => {
      const wrapper = await mountContestDetailView(999)
      await flushPromises()
      expect(wrapper.text()).toContain('比赛不存在')
    })

    it('API失败时不崩溃', async () => {
      const contestsApi = await import('../../api/contests')
      vi.mocked(contestsApi.fetchContestDetail).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = await mountContestDetailView()
      await flushPromises()
      expect(wrapper.find('.contest-detail-page').exists()).toBe(true)
    })
  })

  describe('数据缓存', () => {
    it('切换Tab后回切不重复加载', async () => {
      const wrapper = await mountContestDetailView()
      await flushPromises()

      const contestsApi = await import('../../api/contests')
      const initialCalls = vi.mocked(contestsApi.fetchContestProblems).mock.calls.length

      // 切换到排名Tab
      const tabPanes = wrapper.findAllComponents({ name: 'NTabPane' })
      const rankingTab = tabPanes.find((t) => t.props('tab') === '排名')
      if (rankingTab) {
        await rankingTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
      }

      // 切回题目Tab
      const problemsTab = tabPanes.find((t) => t.props('tab') === '题目列表')
      if (problemsTab) {
        await problemsTab.trigger('click')
        await wrapper.vm.$nextTick()
        await flushPromises()
      }

      // 题目API不应该被额外调用（已缓存）
      expect(vi.mocked(contestsApi.fetchContestProblems).mock.calls.length).toBe(initialCalls)
    })
  })
})
