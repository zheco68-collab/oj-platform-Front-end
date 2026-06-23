/**
 * AdminDashboard 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import AdminDashboard from '../admin/AdminDashboard.vue'
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

// ==================== 辅助函数 ====================

function mountDashboard() {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/admin', name: 'admin', component: AdminDashboard },
    { path: '/admin/problems', name: 'admin-problems', component: { template: '<div>Problems</div>' } },
    { path: '/admin/contests', name: 'admin-contests', component: { template: '<div>Contests</div>' } },
    { path: '/admin/announcements', name: 'admin-announcements', component: { template: '<div>Announcements</div>' } },
    { path: '/admin/users', name: 'admin-users', component: { template: '<div>Users</div>' } },
  ])
  return mountWithPlugins(AdminDashboard, { router, pinia })
}

// ==================== 测试 ====================

describe('AdminDashboard', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  describe('页面渲染', () => {
    it('应该渲染页面标题', () => {
      const wrapper = mountDashboard()
      expect(wrapper.find('.page-title-row h1').text()).toBe('管理面板')
    })

    it('应该渲染 Admin 标签', () => {
      const wrapper = mountDashboard()
      expect(wrapper.text()).toContain('Admin')
    })

    it('应该渲染副标题', () => {
      const wrapper = mountDashboard()
      expect(wrapper.find('.page-subtitle').text()).toBe('平台内容与用户管理')
    })
  })

  describe('数据概览', () => {
    it('应该渲染 4 个概览卡片', () => {
      const wrapper = mountDashboard()
      const cards = wrapper.findAll('.overview-card')
      expect(cards.length).toBe(4)
    })

    it('应该显示概览标签和数值', () => {
      const wrapper = mountDashboard()
      expect(wrapper.text()).toContain('题目总数')
      expect(wrapper.text()).toContain('比赛总数')
      expect(wrapper.text()).toContain('注册用户')
      expect(wrapper.text()).toContain('今日提交')
    })
  })

  describe('功能入口', () => {
    it('应该渲染 4 个入口卡片', () => {
      const wrapper = mountDashboard()
      const cards = wrapper.findAll('.entry-card')
      expect(cards.length).toBe(4)
    })

    it('应该显示入口标题', () => {
      const wrapper = mountDashboard()
      expect(wrapper.text()).toContain('题目管理')
      expect(wrapper.text()).toContain('比赛管理')
      expect(wrapper.text()).toContain('公告管理')
      expect(wrapper.text()).toContain('用户管理')
    })

    it('应该显示入口描述', () => {
      const wrapper = mountDashboard()
      expect(wrapper.text()).toContain('新建、编辑题目信息')
      expect(wrapper.text()).toContain('创建比赛、配置赛制')
      expect(wrapper.text()).toContain('发布站内公告')
      expect(wrapper.text()).toContain('查看用户列表')
    })

    it('每个入口卡片有"进入管理"按钮', () => {
      const wrapper = mountDashboard()
      const buttons = wrapper.findAll('.entry-footer .n-button')
      expect(buttons.length).toBe(4)
      buttons.forEach((btn) => {
        expect(btn.text()).toContain('进入管理')
      })
    })

    it('每个入口卡片有功能按钮', () => {
      const wrapper = mountDashboard()
      // 每个入口有 actions 项
      expect(wrapper.text()).toContain('新建题目')
      expect(wrapper.text()).toContain('创建比赛')
      expect(wrapper.text()).toContain('发布公告')
      expect(wrapper.text()).toContain('用户列表')
    })
  })

  describe('导航跳转', () => {
    it('点击"进入管理"按钮导航到对应页面', async () => {
      const wrapper = mountDashboard()
      await flushPromises()

      const buttons = wrapper.findAll('.entry-footer .n-button')
      // 点击第一个入口的"进入管理"（题目管理）
      if (buttons.length > 0) {
        await buttons[0].trigger('click')
        await flushPromises()
        const route = wrapper.vm.$router.currentRoute.value
        expect(route.name).toBe('admin-problems')
      }
    })
  })
})
