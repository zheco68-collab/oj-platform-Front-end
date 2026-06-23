/**
 * HomeView 组件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import HomeView from '../HomeView.vue'
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

const mockBannerData = [
  { id: 1, imageUrl: 'https://example.com/img1.jpg', linkUrl: '/contest/1', title: 'Banner 1' },
  { id: 2, imageUrl: 'https://example.com/img2.jpg', linkUrl: '/problem/1001', title: 'Banner 2' },
  { id: 3, imageUrl: 'https://example.com/img3.jpg', linkUrl: '/contest/2', title: 'Banner 3' },
]

const mockContestData = [
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
    name: '周赛 #56',
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
    name: '新手练习赛',
    category: 'TEAM' as const,
    type: 'OI' as const,
    status: 'ENDED' as const,
    rated: false,
    startTime: '2026-06-15T10:00:00Z',
    endTime: '2026-06-16T10:00:00Z',
    organizer: '训练营',
  },
]

const mockAnnouncementData = [
  {
    id: 1,
    title: '置顶公告：平台上线',
    content: '内容1',
    pinned: true,
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 2,
    title: '普通公告：维护通知',
    content: '内容2',
    pinned: false,
    createdAt: '2026-06-15T09:00:00Z',
  },
]

// Mock home API
vi.mock('../../api/home', () => ({
  fetchBanners: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: mockBannerData }),
  ),
  fetchHomeContests: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: mockContestData }),
  ),
  fetchAnnouncements: vi.fn(() =>
    Promise.resolve({ code: 200, message: 'ok', data: mockAnnouncementData }),
  ),
}))

// ==================== 辅助函数 ====================

function mountHomeView() {
  const pinia = createTestPinia()
  setActivePinia(pinia)
  const router = createTestRouter([
    { path: '/', name: 'home', component: HomeView },
    { path: '/problem', name: 'problem-list', component: { template: '<div/>' } },
    { path: '/problem/:id', name: 'problem-detail', component: { template: '<div/>' } },
    { path: '/contest', name: 'contest-list', component: { template: '<div/>' } },
    { path: '/contest/:id', name: 'contest-detail', component: { template: '<div/>' } },
    { path: '/solution/:id', name: 'solution-detail', component: { template: '<div/>' } },
  ])
  return mountWithPlugins(HomeView, { router, pinia })
}

// ==================== 测试 ====================

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
    vi.useFakeTimers()
  })

  describe('Banner 轮播', () => {
    it('应该渲染 Banner 轮播区域', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.banner-carousel').exists()).toBe(true)
    })

    it('应该显示 Banner 图片', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      const img = wrapper.find('.banner-image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(mockBannerData[0].imageUrl)
    })

    it('应该显示 Banner 标题', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[0].title)
    })

    it('应该显示左右切换箭头', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.banner-arrow-left').exists()).toBe(true)
      expect(wrapper.find('.banner-arrow-right').exists()).toBe(true)
    })

    it('应该显示指示器点', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      const dots = wrapper.findAll('.banner-dot')
      expect(dots.length).toBe(3)
    })

    it('第一个指示器应该激活', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      const dots = wrapper.findAll('.banner-dot')
      expect(dots[0].classes()).toContain('active')
    })

    it('点击右箭头切换到下一张', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      await wrapper.find('.banner-arrow-right').trigger('click')
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[1].title)
    })

    it('点击左箭头切换到上一张', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      await wrapper.find('.banner-arrow-left').trigger('click')
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[2].title)
    })

    it('点击指示器切换到指定 Banner', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      const dots = wrapper.findAll('.banner-dot')
      await dots[2].trigger('click')
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[2].title)
    })

    it('自动轮播 4 秒后切换', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[0].title)
      vi.advanceTimersByTime(4000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[1].title)
    })

    it('鼠标悬停暂停轮播', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      await wrapper.find('.banner-carousel').trigger('mouseenter')
      vi.advanceTimersByTime(8000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.banner-caption').text()).toBe(mockBannerData[0].title)
    })
  })

  describe('倒计时栏', () => {
    it('有即将开始的比赛时显示倒计时', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.countdown-section').exists()).toBe(true)
    })

    it('显示即将开始的比赛名称', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.countdown-label').text()).toContain('周赛 #56')
    })
  })

  describe('快捷跳题', () => {
    it('应该渲染快捷跳题区域', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.quickjump-section').exists()).toBe(true)
    })

    it('应该显示随机跳题按钮', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('随机跳题')
    })

    it('点击随机跳题路由变化', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      const allButtons = wrapper.findAllComponents({ name: 'NButton' })
      const randomJumpBtn = allButtons.find((b) => b.text().includes('随机跳题'))
      if (randomJumpBtn) {
        await randomJumpBtn.trigger('click')
        await flushPromises()
        const currentRoute = wrapper.vm.$router.currentRoute.value
        expect(currentRoute.name).toBe('problem-detail')
      }
    })

    it('输入框存在', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.quickjump-input').exists()).toBe(true)
    })
  })

  describe('公告区', () => {
    it('应该渲染公告列表', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.announcement-list').exists()).toBe(true)
    })

    it('置顶公告显示"置顶"标签', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.html()).toContain('置顶')
    })

    it('公告标题正确显示', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('置顶公告：平台上线')
      expect(wrapper.text()).toContain('普通公告：维护通知')
    })

    it('公告显示发布时间', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('2026-06-20')
    })
  })

  describe('近期比赛', () => {
    it('应该渲染比赛卡片', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.contest-grid').exists()).toBe(true)
    })

    it('比赛卡片数量正确', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      const cards = wrapper.findAll('.contest-card')
      expect(cards.length).toBe(4)
    })

    it('比赛卡片显示比赛名称', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('夏季算法竞赛')
      expect(wrapper.text()).toContain('周赛 #56')
      expect(wrapper.text()).toContain('周赛 #55 — 图论')
    })

    it('比赛卡片显示状态标签', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('进行中')
    })

    it('比赛卡片显示主办方', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('OJ 官方')
    })

    it('点击比赛卡片跳转到比赛详情', async () => {
      const wrapper = mountHomeView()
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

  describe('页面整体', () => {
    it('应该正确渲染标题', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).toContain('站内公告')
      expect(wrapper.text()).toContain('近期比赛')
      expect(wrapper.text()).toContain('快捷跳题')
    })

    it('不包含最新题解模块', async () => {
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.text()).not.toContain('最新题解')
    })

    it('API 失败时不会崩溃', async () => {
      const homeApi = await import('../../api/home')
      vi.mocked(homeApi.fetchHomeContests).mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountHomeView()
      await flushPromises()
      expect(wrapper.find('.home-page').exists()).toBe(true)
    })
  })
})
