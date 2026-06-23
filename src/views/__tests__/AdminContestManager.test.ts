/**
 * AdminContestManager 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import AdminContestManager from '../admin/AdminContestManager.vue'
import { createTestPinia, createTestRouter, mountWithPlugins } from '../../test/helpers'

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

const mockContests = [
  {
    id: 1,
    name: '夏季算法竞赛',
    category: 'OFFICIAL' as const,
    type: 'IOI' as const,
    status: 'UPCOMING' as const,
    rated: true,
    startTime: '2026-06-26T06:00:00Z',
    endTime: '2026-06-30T06:00:00Z',
    organizer: 'OJ 官方',
  },
  {
    id: 2,
    name: '周赛 #56',
    category: 'PUBLIC' as const,
    type: 'ICPC' as const,
    status: 'UPCOMING' as const,
    rated: true,
    startTime: '2026-06-24T06:00:00Z',
    endTime: '2026-06-24T08:00:00Z',
    organizer: 'Admin',
  },
]

// Mock contest detail map
vi.mock('../../api/mock/contests', () => ({
  mockContestDetailMap: {
    1: {
      id: 1,
      name: '夏季算法竞赛',
      category: 'OFFICIAL',
      type: 'IOI',
      status: 'UPCOMING',
      rated: true,
      startTime: '2026-06-26T06:00:00Z',
      endTime: '2026-06-30T06:00:00Z',
      organizer: 'OJ 官方',
      description: '# Desc',
      problems: [
        { id: 101, order: 1, title: 'A. 数字游戏', difficulty: 'entry', acceptedCount: 0, submissionCount: 0 },
      ],
      ranking: [],
    },
  },
}))

vi.mock('../../api/admin', () => ({
  fetchAdminContests: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { data: mockContests, total: mockContests.length, page: 1, size: 10 },
    }),
  ),
  createContest: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 9, name: '新比赛', category: 'PUBLIC', type: 'ICPC', status: 'UPCOMING', rated: true, startTime: '2026-07-01T00:00:00Z', endTime: '2026-07-02T00:00:00Z', organizer: 'test' },
    }),
  ),
  updateContest: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 1, name: '已更新', category: 'OFFICIAL', type: 'IOI', status: 'UPCOMING', rated: false, startTime: '2026-06-26T06:00:00Z', endTime: '2026-06-30T06:00:00Z', organizer: 'OJ 官方' },
    }),
  ),
  deleteContest: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: null }),
  ),
}))

function mountManager() {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter()
  return mountWithPlugins(AdminContestManager, { router, pinia })
}

describe('AdminContestManager', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染页面标题', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.page-title-row h1').text()).toBe('比赛管理')
    })

    it('应该渲染"创建比赛"按钮', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.page-title-row .n-button').text()).toContain('创建比赛')
    })

    it('应该渲染数据表格', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('夏季算法竞赛')
    })
  })

  describe('数据展示', () => {
    it('应该显示比赛数据', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('夏季算法竞赛')
      expect(wrapper.text()).toContain('周赛 #56')
    })

    it('应该显示比赛状态标签', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('未开始')
    })

    it('Rated 比赛显示 Rated 标签', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('Rated')
    })
  })

  describe('创建比赛弹窗', () => {
    it('点击"创建比赛"打开弹窗', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Naive UI NModal 渲染到 document.body
      expect(document.body.innerHTML).toContain('比赛名称')
    })

    it('弹窗包含表单字段', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Naive UI NModal 渲染到 document.body
      expect(document.body.innerHTML).toContain('比赛名称')
      expect(document.body.innerHTML).toContain('比赛类别')
    })
  })

  describe('错误处理', () => {
    it('API 失败时不崩溃', async () => {
      const adminApi = await import('../../api/admin')
      vi.mocked(adminApi.fetchAdminContests).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.admin-contest-manager').exists()).toBe(true)
    })
  })
})
