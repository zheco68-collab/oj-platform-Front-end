/**
 * AdminAnnouncementManager 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import AdminAnnouncementManager from '../admin/AdminAnnouncementManager.vue'
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

const mockAnnouncements = [
  {
    id: 1,
    title: 'OJ 平台 v1.0 正式上线公告',
    content: '# 公告内容...',
    pinned: true,
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 2,
    title: '服务器维护通知',
    content: '维护通知内容...',
    pinned: false,
    createdAt: '2026-06-18T08:00:00Z',
  },
]

vi.mock('../../api/admin', () => ({
  fetchAdminAnnouncements: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { data: mockAnnouncements, total: mockAnnouncements.length, page: 1, size: 10 },
    }),
  ),
  createAnnouncement: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 10, title: '新公告', content: '内容', pinned: false, createdAt: new Date().toISOString() },
    }),
  ),
  updateAnnouncement: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 1, title: '已更新', content: '新内容', pinned: true, createdAt: '2026-06-20T10:00:00Z' },
    }),
  ),
  deleteAnnouncement: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: null }),
  ),
  toggleAnnouncementPin: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: { id: 1, title: 'OJ 平台 v1.0', content: '...', pinned: false, createdAt: '2026-06-20T10:00:00Z' },
    }),
  ),
}))

function mountManager() {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter()
  return mountWithPlugins(AdminAnnouncementManager, { router, pinia })
}

describe('AdminAnnouncementManager', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染页面标题', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.page-title-row h1').text()).toBe('公告管理')
    })

    it('应该渲染"发布公告"按钮', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.page-title-row .n-button').text()).toContain('发布公告')
    })

    it('应该渲染数据表格', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('OJ 平台 v1.0 正式上线公告')
    })
  })

  describe('数据展示', () => {
    it('应该显示公告数据', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('OJ 平台 v1.0 正式上线公告')
      expect(wrapper.text()).toContain('服务器维护通知')
    })

    it('置顶公告显示"置顶"标签', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('置顶')
    })

    it('每行有置顶、编辑、删除按钮', async () => {
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.text()).toContain('取消置顶')
      expect(wrapper.text()).toContain('编辑')
    })
  })

  describe('发布公告弹窗', () => {
    it('点击"发布公告"打开弹窗', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Naive UI NModal 渲染到 document.body
      expect(document.body.innerHTML).toContain('公告标题')
    })

    it('弹窗包含表单字段', async () => {
      const wrapper = mountManager()
      await flushPromises()

      const addBtn = wrapper.find('.page-title-row button')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Naive UI NModal 渲染到 document.body
      expect(document.body.innerHTML).toContain('公告标题')
      expect(document.body.innerHTML).toContain('公告内容')
    })
  })

  describe('错误处理', () => {
    it('API 失败时不崩溃', async () => {
      const adminApi = await import('../../api/admin')
      vi.mocked(adminApi.fetchAdminAnnouncements).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountManager()
      await flushPromises()
      expect(wrapper.find('.admin-announcement-manager').exists()).toBe(true)
    })
  })
})
