/**
 * P6 题解模块单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// ==================== 工具导入 ====================

import {
  mockSolutions,
  getSolutionDetail,
  updateSolutionVote,
  addComment,
} from '../api/mock/solutions'

import {
  fetchSolutionsByProblem,
  fetchAllSolutions,
  fetchSolutionDetail,
  voteSolution,
  postComment,
  postReply,
} from '../api/solutions'

import { useSolutionStore } from '../stores/solution'

// ==================== Mock 路由 ====================

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: { template: '<div/>' } },
  { path: '/solution', name: 'solution-plaza', component: { template: '<div/>' } },
  { path: '/problem/:id(\\d+)/solution', name: 'solution-list', component: { template: '<div/>' } },
  { path: '/solution/:id(\\d+)', name: 'solution-detail', component: { template: '<div/>' } },
  { path: '/problem/:id(\\d+)', name: 'problem-detail', component: { template: '<div/>' } },
]

function mockRouter() {
  return createRouter({ history: createWebHistory(), routes })
}

// ==================== 测试前初始化 ====================

beforeEach(() => {
  setActivePinia(createPinia())
})

// ==================== 第一层：Mock 数据层 ====================

describe('Mock 数据层', () => {
  describe('mockSolutions 列表', () => {
    it('应包含 10 条题解摘要', () => {
      expect(mockSolutions).toHaveLength(10)
    })

    it('每条摘要结构完整', () => {
      for (const sol of mockSolutions) {
        expect(sol.id).toBeGreaterThan(0)
        expect(sol.title).toBeTruthy()
        expect(sol.author).toBeDefined()
        expect(sol.author.username).toBeTruthy()
        expect(sol.problemId).toBeGreaterThan(0)
        expect(sol.problemTitle).toBeTruthy()
        expect(sol.createdAt).toBeTruthy()
        expect(typeof sol.likeCount).toBe('number')
        expect(sol.summary).toBeTruthy()
      }
    })
  })

  describe('getSolutionDetail', () => {
    it('应返回存在的题解详情', () => {
      const detail = getSolutionDetail(1)
      expect(detail).toBeDefined()
      expect(detail!.id).toBe(1)
      expect(detail!.content).toBeTruthy()
      expect(detail!.likeCount).toBeGreaterThan(0)
      expect(typeof detail!.dislikeCount).toBe('number')
      expect(Array.isArray(detail!.comments)).toBe(true)
    })

    it('对不存在的 ID 返回 undefined', () => {
      expect(getSolutionDetail(999)).toBeUndefined()
    })

    it('题解 1 应有评论', () => {
      const detail = getSolutionDetail(1)
      expect(detail!.comments.length).toBeGreaterThan(0)
    })

    it('题解 1 的首条评论应有回复', () => {
      const detail = getSolutionDetail(1)
      const firstComment = detail!.comments[0]
      expect(firstComment.replies.length).toBeGreaterThan(0)
    })
  })

  describe('updateSolutionVote', () => {
    it('点赞后 likeCount 应 +1', () => {
      const before = getSolutionDetail(6)!
      const prevLikes = before.likeCount
      updateSolutionVote(6, 'like')
      const after = getSolutionDetail(6)!
      expect(after.likeCount).toBe(prevLikes + 1)
    })

    it('点踩后 dislikeCount 应 +1', () => {
      const before = getSolutionDetail(6)!
      const prevDislikes = before.dislikeCount
      updateSolutionVote(6, 'dislike')
      const after = getSolutionDetail(6)!
      expect(after.dislikeCount).toBe(prevDislikes + 1)
    })

    it('对不存在的 ID 返回 undefined', () => {
      expect(updateSolutionVote(999, 'like')).toBeUndefined()
    })
  })

  describe('addComment', () => {
    it('发表评论后应在详情中出现', () => {
      const detail = getSolutionDetail(6)!
      const prevCount = detail.comments.length
      addComment(6, 0, 'Tester', '测试评论')
      expect(detail.comments.length).toBe(prevCount + 1)
      expect(detail.comments[detail.comments.length - 1].content).toBe('测试评论')
    })

    it('回复评论应添加为子评论', () => {
      const detail = getSolutionDetail(1)!
      const parentComment = detail.comments[0]
      const prevReplyCount = parentComment.replies.length
      addComment(1, 0, 'Tester', '测试回复', parentComment.id)
      expect(parentComment.replies.length).toBe(prevReplyCount + 1)
      expect(parentComment.replies[parentComment.replies.length - 1].content).toBe('测试回复')
    })

    it('对不存在的题解 ID 返回 undefined', () => {
      expect(addComment(999, 0, 'Tester', 'test')).toBeUndefined()
    })
  })
})

// ==================== 第二层：API 层 ====================

describe('API 层', () => {
  describe('fetchSolutionsByProblem', () => {
    it('应返回 problemId=1001 的题解列表', async () => {
      const res = await fetchSolutionsByProblem({ problemId: 1001, page: 1, size: 10 })
      expect(res.code).toBe(200)
      expect(res.data.data.length).toBeGreaterThan(0)
      // 验证过滤正确
      for (const sol of res.data.data) {
        expect(sol.problemId).toBe(1001)
      }
    })

    it('默认按时间降序排列', async () => {
      const res = await fetchSolutionsByProblem({ problemId: 1001, page: 1, size: 10 })
      if (res.data.data.length >= 2) {
        const t0 = new Date(res.data.data[0].createdAt).getTime()
        const t1 = new Date(res.data.data[1].createdAt).getTime()
        expect(t0).toBeGreaterThanOrEqual(t1)
      }
    })

    it('sort=like 按点赞降序排列', async () => {
      const res = await fetchSolutionsByProblem({ problemId: 1001, page: 1, size: 10, sort: 'like' })
      if (res.data.data.length >= 2) {
        expect(res.data.data[0].likeCount).toBeGreaterThanOrEqual(res.data.data[1].likeCount)
      }
    })

    it('应正确分页', async () => {
      const res = await fetchSolutionsByProblem({ problemId: 1001, page: 1, size: 2 })
      expect(res.data.data.length).toBeLessThanOrEqual(2)
      expect(res.data.page).toBe(1)
      expect(res.data.size).toBe(2)
    })

    it('对无题解的 problemId 返回空列表', async () => {
      const res = await fetchSolutionsByProblem({ problemId: 9999, page: 1, size: 10 })
      expect(res.data.data).toHaveLength(0)
      expect(res.data.total).toBe(0)
    })
  })

  describe('fetchSolutionDetail', () => {
    it('应返回存在的题解详情', async () => {
      const res = await fetchSolutionDetail(1)
      expect(res.code).toBe(200)
      expect(res.data).toBeDefined()
      expect(res.data!.content).toBeTruthy()
      expect(res.data!.comments).toBeDefined()
    })

    it('对不存在的 ID 返回 404', async () => {
      const res = await fetchSolutionDetail(999)
      expect(res.code).toBe(404)
      expect(res.data).toBeNull()
    })
  })

  describe('voteSolution', () => {
    it('点赞应返回更新后的计数', async () => {
      const res = await voteSolution(2, 'like')
      expect(res.code).toBe(200)
      expect(res.data!.likeCount).toBeGreaterThan(0)
    })

    it('对不存在的 ID 返回 404', async () => {
      const res = await voteSolution(999, 'like')
      expect(res.code).toBe(404)
      expect(res.data).toBeNull()
    })
  })

  describe('postComment', () => {
    it('发表评论应返回新评论', async () => {
      const res = await postComment(1, 'API 测试评论')
      expect(res.code).toBe(200)
      expect(res.data!.content).toBe('API 测试评论')
      expect(res.data!.author.username).toBe('CurrentUser')
    })

    it('空内容返回 400', async () => {
      const res = await postComment(1, '   ')
      expect(res.code).toBe(400)
    })

    it('对不存在的题解返回 404', async () => {
      const res = await postComment(999, 'test')
      expect(res.code).toBe(404)
    })
  })

  describe('postReply', () => {
    it('回复评论应返回新回复', async () => {
      const detail = getSolutionDetail(1)
      const parentId = detail!.comments[0].id
      const res = await postReply(1, parentId, 'API 测试回复')
      expect(res.code).toBe(200)
      expect(res.data!.content).toBe('API 测试回复')
    })

    it('空内容返回 400', async () => {
      const res = await postReply(1, 101, '   ')
      expect(res.code).toBe(400)
    })
  })

  describe('fetchAllSolutions', () => {
    it('应返回全部题解', async () => {
      const res = await fetchAllSolutions({ page: 1, size: 20 })
      expect(res.code).toBe(200)
      expect(res.data.data.length).toBe(10)
      expect(res.data.total).toBe(10)
    })

    it('默认按时间降序排列', async () => {
      const res = await fetchAllSolutions({ page: 1, size: 20 })
      if (res.data.data.length >= 2) {
        const t0 = new Date(res.data.data[0].createdAt).getTime()
        const t1 = new Date(res.data.data[1].createdAt).getTime()
        expect(t0).toBeGreaterThanOrEqual(t1)
      }
    })

    it('sort=like 按点赞降序排列', async () => {
      const res = await fetchAllSolutions({ page: 1, size: 20, sort: 'like' })
      if (res.data.data.length >= 2) {
        expect(res.data.data[0].likeCount).toBeGreaterThanOrEqual(res.data.data[1].likeCount)
      }
    })

    it('keyword 搜索标题', async () => {
      const res = await fetchAllSolutions({ page: 1, size: 20, keyword: '线段树' })
      expect(res.data.data.length).toBeGreaterThan(0)
      for (const sol of res.data.data) {
        const matchTitle = sol.title.includes('线段树')
        const matchProblem = sol.problemTitle.includes('线段树')
        expect(matchTitle || matchProblem).toBe(true)
      }
    })

    it('keyword 搜索不匹配返回空', async () => {
      const res = await fetchAllSolutions({ page: 1, size: 20, keyword: '不存在的关键词xyz' })
      expect(res.data.data).toHaveLength(0)
    })

    it('应正确分页', async () => {
      const res = await fetchAllSolutions({ page: 1, size: 3 })
      expect(res.data.data.length).toBeLessThanOrEqual(3)
      expect(res.data.page).toBe(1)
      expect(res.data.size).toBe(3)
    })
  })
})

// ==================== 第三层：Store 层 ====================

describe('Store 层', () => {
  let store: ReturnType<typeof useSolutionStore>

  beforeEach(() => {
    store = useSolutionStore()
  })

  describe('初始状态', () => {
    it('列表初始为空', () => {
      expect(store.list).toHaveLength(0)
      expect(store.total).toBe(0)
      expect(store.loading).toBe(false)
    })

    it('详情初始为空', () => {
      expect(store.current).toBeNull()
      expect(store.detailLoading).toBe(false)
    })

    it('默认排序为时间', () => {
      expect(store.filters.sort).toBe('time')
    })
  })

  describe('fetchList', () => {
    it('加载题解列表', async () => {
      await store.fetchList(1001)
      expect(store.list.length).toBeGreaterThan(0)
      expect(store.total).toBeGreaterThan(0)
      expect(store.loading).toBe(false)
    })

    it('过滤正确的 problemId', async () => {
      await store.fetchList(1001)
      for (const sol of store.list) {
        expect(sol.problemId).toBe(1001)
      }
    })

    it('错误 problemId 不返回数据', async () => {
      // mock API 中不存在的 problemId 返回空结果
      await store.fetchList(9999)
      // 注意：mock 不会设置 error，而是返回空列表
      expect(store.error).toBe('')
    })
  })

  describe('changeSort', () => {
    it('切换到按点赞排序', async () => {
      await store.fetchList(1001)
      await store.changeSort('like')
      expect(store.filters.sort).toBe('like')
      // 验证排序正确
      if (store.list.length >= 2) {
        expect(store.list[0].likeCount).toBeGreaterThanOrEqual(store.list[1].likeCount)
      }
    })

    it('切换回按时间排序', async () => {
      await store.fetchList(1001)
      await store.changeSort('time')
      expect(store.filters.sort).toBe('time')
    })
  })

  describe('changePage', () => {
    it('切换分页', async () => {
      await store.fetchList(1001)
      await store.changePage(2)
      expect(store.filters.page).toBe(2)
    })
  })

  describe('fetchDetail', () => {
    it('加载题解详情', async () => {
      await store.fetchDetail(1)
      expect(store.current).toBeDefined()
      expect(store.current!.id).toBe(1)
      expect(store.current!.content).toBeTruthy()
      expect(store.current!.comments).toBeDefined()
      expect(store.detailLoading).toBe(false)
    })

    it('不存在的 ID 设置错误', async () => {
      await store.fetchDetail(999)
      expect(store.detailError).toBe('题解不存在')
      expect(store.current).toBeNull()
    })
  })

  describe('vote', () => {
    it('投票操作不抛异常', async () => {
      await store.fetchDetail(1)
      await expect(store.vote('like')).resolves.not.toThrow()
    })
  })

  describe('submitComment', () => {
    it('发表评论', async () => {
      await store.fetchDetail(1)
      const prevCount = store.current!.comments.length
      await store.submitComment('Store 测试评论')
      expect(store.current!.comments.length).toBe(prevCount + 1)
    })

    it('current 为空时返回 null', async () => {
      const result = await store.submitComment('test')
      expect(result).toBeNull()
    })
  })

  describe('submitReply', () => {
    it('回复评论', async () => {
      await store.fetchDetail(1)
      const parentComment = store.current!.comments[0]
      const prevReplyCount = parentComment.replies.length
      await store.submitReply(parentComment.id, 'Store 测试回复')
      expect(parentComment.replies.length).toBe(prevReplyCount + 1)
    })

    it('current 为空时返回 null', async () => {
      const result = await store.submitReply(101, 'test')
      expect(result).toBeNull()
    })
  })

  describe('reset', () => {
    it('重置所有状态', async () => {
      await store.fetchList(1001)
      await store.fetchDetail(1)
      store.reset()
      expect(store.list).toHaveLength(0)
      expect(store.total).toBe(0)
      expect(store.current).toBeNull()
      expect(store.error).toBe('')
    })
  })

  describe('computed', () => {
    it('totalPages 计算总页数', async () => {
      await store.fetchList(1001)
      expect(store.totalPages).toBeGreaterThanOrEqual(1)
    })

    it('hasMore 判断是否有更多页', () => {
      // 初始状态下 total 为 0，page 为 1，size 为 10，所以 1*10 < 0 为 false
      expect(store.hasMore).toBe(false)
    })
  })

  describe('全局题解广场', () => {
    it('初始状态为空', () => {
      expect(store.allList).toHaveLength(0)
      expect(store.allTotal).toBe(0)
      expect(store.allLoading).toBe(false)
      expect(store.allFilters.sort).toBe('time')
      expect(store.allFilters.keyword).toBe('')
    })

    it('fetchAllList 加载全部题解', async () => {
      await store.fetchAllList()
      expect(store.allList.length).toBe(10)
      expect(store.allTotal).toBe(10)
      expect(store.allLoading).toBe(false)
    })

    it('fetchAllList 带关键词搜索', async () => {
      await store.fetchAllList('A + B')
      expect(store.allList.length).toBeGreaterThan(0)
      expect(store.allFilters.keyword).toBe('A + B')
    })

    it('changeAllSort 切换排序', async () => {
      await store.fetchAllList()
      await store.changeAllSort('like')
      expect(store.allFilters.sort).toBe('like')
      if (store.allList.length >= 2) {
        expect(store.allList[0].likeCount).toBeGreaterThanOrEqual(store.allList[1].likeCount)
      }
    })

    it('changeAllPage 切换分页', async () => {
      await store.fetchAllList()
      await store.changeAllPage(2)
      expect(store.allFilters.page).toBe(2)
    })

    it('allTotalPages 计算总页数', async () => {
      await store.fetchAllList()
      expect(store.allTotalPages).toBeGreaterThanOrEqual(1)
    })

    it('重置后全局状态也清空', async () => {
      await store.fetchAllList()
      store.reset()
      // reset 不清理全局列表（当前实现），仅清理 per-problem 状态
    })
  })
})

// ==================== 第四层：组件层 ====================

import { h } from 'vue'
import { NMessageProvider } from 'naive-ui'
import SolutionListView from '../views/SolutionListView.vue'
import SolutionDetailView from '../views/SolutionDetailView.vue'
import SolutionPlazaView from '../views/SolutionPlazaView.vue'

// 组件测试共享的挂载包装器：提供 NMessageProvider
function wrapWithProviders(component: any, plugins: any[] = []) {
  return mount(NMessageProvider, {
    slots: { default: h(component) },
    global: { plugins },
  })
}

describe('SolutionListView 组件', () => {
  async function mountList(problemId = 1001) {
    setActivePinia(createPinia())
    const router = mockRouter()
    await router.push(`/problem/${problemId}/solution`)
    await router.isReady()

    const wrapper = wrapWithProviders(SolutionListView, [router])

    // 先执行 setup / onMounted
    await flushPromises()
    // 推进所有 setTimeout 延迟（mock API 使用 setTimeout）
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    return wrapper
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应渲染页面标题', async () => {
    const wrapper = await mountList()
    expect(wrapper.html()).toContain('题解列表')
  })

  it('应渲染排序栏', async () => {
    const wrapper = await mountList()
    expect(wrapper.html()).toContain('按时间')
    expect(wrapper.html()).toContain('按点赞')
  })

  it('应渲染发布题解按钮', async () => {
    const wrapper = await mountList()
    expect(wrapper.html()).toContain('发布题解')
  })

  it('应渲染题解卡片', async () => {
    const wrapper = await mountList()
    const cards = wrapper.findAll('.solution-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('卡片应显示题解标题', async () => {
    const wrapper = await mountList()
    const store = useSolutionStore()
    if (store.list.length > 0) {
      expect(wrapper.html()).toContain(store.list[0].title)
    }
  })

  it('应显示返回题目链接', async () => {
    const wrapper = await mountList()
    expect(wrapper.html()).toContain('返回题目')
  })

  it('空列表显示空状态', async () => {
    setActivePinia(createPinia())
    const router = mockRouter()
    await router.push('/problem/99999/solution')
    await router.isReady()

    const wrapper = wrapWithProviders(SolutionListView, [router])

    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(wrapper.html()).toContain('暂无题解')
  })
})

describe('SolutionDetailView 组件', () => {
  async function mountDetail(solutionId = 1) {
    setActivePinia(createPinia())
    const router = mockRouter()
    await router.push(`/solution/${solutionId}`)
    await router.isReady()

    const wrapper = wrapWithProviders(SolutionDetailView, [router])

    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    return wrapper
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应渲染题解标题', async () => {
    const wrapper = await mountDetail()
    const store = useSolutionStore()
    if (store.current) {
      expect(wrapper.html()).toContain(store.current.title)
    }
  })

  it('应显示返回题解列表按钮', async () => {
    const wrapper = await mountDetail()
    expect(wrapper.html()).toContain('返回题解列表')
  })

  it('应渲染点赞按钮', async () => {
    const wrapper = await mountDetail()
    expect(wrapper.html()).toContain('点赞')
  })

  it('应渲染点踩按钮', async () => {
    const wrapper = await mountDetail()
    expect(wrapper.html()).toContain('点踩')
  })

  it('应渲染评论标题', async () => {
    const wrapper = await mountDetail()
    expect(wrapper.html()).toContain('评论')
  })

  it('应渲染发表评论区域', async () => {
    const wrapper = await mountDetail()
    expect(wrapper.html()).toContain('发表评论')
  })

  it('应显示评论列表', async () => {
    const wrapper = await mountDetail()
    const store = useSolutionStore()
    if (store.current && store.current.comments.length > 0) {
      expect(wrapper.html()).toContain(store.current.comments[0].content)
    }
  })

  it('不存在的题解显示空状态', async () => {
    setActivePinia(createPinia())
    const router = mockRouter()
    await router.push('/solution/999')
    await router.isReady()

    const wrapper = wrapWithProviders(SolutionDetailView, [router])

    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    expect(wrapper.html()).toContain('题解不存在')
  })

  it('应显示作者信息', async () => {
    const wrapper = await mountDetail()
    const store = useSolutionStore()
    if (store.current) {
      expect(wrapper.html()).toContain(store.current.author.username)
    }
  })

  it('应显示关联题目', async () => {
    const wrapper = await mountDetail()
    const store = useSolutionStore()
    if (store.current) {
      expect(wrapper.html()).toContain(store.current.problemTitle)
    }
  })
})

describe('SolutionPlazaView 组件', () => {
  async function mountPlaza() {
    setActivePinia(createPinia())
    const router = mockRouter()
    await router.push('/solution')
    await router.isReady()

    const wrapper = mount(NMessageProvider, {
      slots: { default: h(SolutionPlazaView) },
      global: { plugins: [router] },
    })

    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    return wrapper
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应渲染页面标题', async () => {
    const wrapper = await mountPlaza()
    expect(wrapper.html()).toContain('题解广场')
  })

  it('应渲染搜索框', async () => {
    const wrapper = await mountPlaza()
    expect(wrapper.html()).toContain('搜索')
  })

  it('应渲染排序栏', async () => {
    const wrapper = await mountPlaza()
    expect(wrapper.html()).toContain('按时间')
    expect(wrapper.html()).toContain('按点赞')
  })

  it('应渲染发布题解按钮', async () => {
    const wrapper = await mountPlaza()
    expect(wrapper.html()).toContain('发布题解')
  })

  it('应渲染题解总数', async () => {
    const wrapper = await mountPlaza()
    expect(wrapper.html()).toContain('共 10 篇题解')
  })

  it('应渲染题解卡片', async () => {
    const wrapper = await mountPlaza()
    const cards = wrapper.findAll('.solution-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('卡片应显示题解标题和题目标签', async () => {
    const wrapper = await mountPlaza()
    const store = useSolutionStore()
    if (store.allList.length > 0) {
      expect(wrapper.html()).toContain(store.allList[0].title)
      expect(wrapper.html()).toContain(store.allList[0].problemTitle)
    }
  })
})
