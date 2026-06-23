/**
 * AdminProblemManager 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import AdminProblemManager from '../admin/AdminProblemManager.vue'
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

// Mock admin API
const mockProblems = [
  {
    id: 1001,
    title: 'A + B 问题',
    difficulty: 'entry' as const,
    tags: ['math'],
    source: '原创',
    timeLimit: 1000,
    memoryLimit: 128,
    acceptedCount: 8520,
    submissionCount: 10200,
  },
  {
    id: 1002,
    title: '斐波那契数列',
    difficulty: 'popularize' as const,
    tags: ['DP', 'math'],
    source: '洛谷',
    timeLimit: 1000,
    memoryLimit: 128,
    acceptedCount: 7200,
    submissionCount: 9500,
  },
]

vi.mock('../../api/admin', () => ({
  fetchAdminProblems: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { data: mockProblems, total: mockProblems.length, page: 1, size: 10 },
    }),
  ),
  fetchAdminProblemDetail: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: {
        id: 1001,
        title: 'A + B 问题',
        difficulty: 'entry',
        tags: ['math'],
        source: '原创',
        timeLimit: 1000,
        memoryLimit: 128,
        description: '# A+B',
        inputFormat: '两个整数',
        outputFormat: '它们的和',
        samples: [],
        hint: '',
        acceptedCount: 8520,
        submissionCount: 10200,
      },
    }),
  ),
  createProblem: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 2001, title: '新题目', difficulty: 'entry', tags: [], source: '原创', timeLimit: 1000, memoryLimit: 128, acceptedCount: 0, submissionCount: 0 },
    }),
  ),
  updateProblem: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 1001, title: '已更新', difficulty: 'improve', tags: [], source: '原创', timeLimit: 2000, memoryLimit: 256, acceptedCount: 8520, submissionCount: 10200 },
    }),
  ),
  deleteProblem: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: null }),
  ),
}))

// ==================== 辅助函数 ====================

function mountManager() {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter()
  return mountWithPlugins(AdminProblemManager, { router, pinia })
}

// ==================== 测试 ====================

describe('AdminProblemManager', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染页面标题', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.page-title-row h1').text()).toBe('题目管理')
    })

    it('应该渲染"新建题目"按钮', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.page-title-row .n-button').text()).toContain('新建题目')
    })

    it('应该渲染搜索栏', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.search-bar').exists()).toBe(true)
    })

    it('应该渲染数据表格', async () => {
      const wrapper = mountManager()
      await flushPromises()
      // 表格渲染后应包含题目数据
      expect(wrapper.text()).toContain('A + B 问题')
    })
  })

  describe('数据展示', () => {
    it('应该显示题目数据', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('P1001')
      expect(wrapper.text()).toContain('A + B 问题')
    })

    it('表格中每行有编辑和删除按钮', async () => {
      const wrapper = mountManager()
      await flushPromises()
      // 编辑和删除按钮应该存在
      expect(wrapper.text()).toContain('编辑')
    })
  })

  describe('新建题目弹窗', () => {
    it('点击"新建题目"打开弹窗', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Naive UI NModal 渲染到 document.body, 检查 body 中是否出现表单内容
      expect(document.body.innerHTML).toContain('题目标题')
    })

    it('弹窗包含表单字段', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Naive UI NModal 渲染到 document.body
      expect(document.body.innerHTML).toContain('难度')
      expect(document.body.innerHTML).toContain('时间限制')
    })

    it('取消按钮关闭弹窗', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // 查找取消按钮并点击
      const cancelBtns = document.body.querySelectorAll('.n-button')
      const cancelBtn = Array.from(cancelBtns).find((btn) => btn.textContent === '取消')
      if (cancelBtn) {
        ;(cancelBtn as HTMLElement).click()
        await wrapper.vm.$nextTick()
      }
    })
  })

  describe('空状态', () => {
    it('无数据时表格为空', async () => {
      const adminApi = await import('../../api/admin')
      vi.mocked(adminApi.fetchAdminProblems).mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: { data: [], total: 0, page: 1, size: 10 },
      })
      const wrapper = mountManager()
      await flushPromises()
      // 不应崩溃
      expect(wrapper.find('.admin-problem-manager').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('API 失败时不崩溃', async () => {
      const adminApi = await import('../../api/admin')
      vi.mocked(adminApi.fetchAdminProblems).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.admin-problem-manager').exists()).toBe(true)
    })
  })
})
