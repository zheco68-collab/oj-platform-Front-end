/**
 * 题目 Store 测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestPinia } from '../../test/helpers'
import { useProblemStore } from '../problem'

// Mock API 模块
vi.mock('../../api/problems', () => ({
  fetchProblems: vi.fn(() =>
    Promise.resolve({
      code: 200,
      message: 'ok',
      data: {
        data: [
          {
            id: 1001,
            title: 'A + B 问题',
            difficulty: 'entry',
            tags: ['math'],
            source: '原创',
            timeLimit: 1000,
            memoryLimit: 128,
            acceptedCount: 8520,
            submissionCount: 10200,
            status: 'AC',
          },
          {
            id: 1002,
            title: '斐波那契数列',
            difficulty: 'entry',
            tags: ['DP', 'math'],
            source: '洛谷',
            timeLimit: 1000,
            memoryLimit: 128,
            acceptedCount: 7200,
            submissionCount: 9500,
            status: 'AC',
          },
        ],
        total: 2,
        page: 1,
        size: 20,
      },
    }),
  ),
  fetchProblemDetail: vi.fn((id: number) =>
    Promise.resolve({
      code: id === 99999 ? 404 : 200,
      message: id === 99999 ? 'not found' : 'ok',
      data:
        id === 99999
          ? null
          : {
              id,
              title: '测试题目',
              difficulty: 'entry',
              tags: ['math'],
              source: '原创',
              timeLimit: 1000,
              memoryLimit: 128,
              description: '# 测试',
              inputFormat: '## 输入',
              outputFormat: '## 输出',
              samples: [{ input: '1', output: '1' }],
              hint: '## 提示',
              acceptedCount: 100,
              submissionCount: 200,
            },
    }),
  ),
}))

describe('useProblemStore', () => {
  beforeEach(() => {
    setActivePinia(createTestPinia())
  })

  it('初始化时有默认筛选条件', () => {
    const store = useProblemStore()
    expect(store.filters.keyword).toBe('')
    expect(store.filters.difficulty).toEqual([])
    expect(store.filters.tags).toEqual([])
    expect(store.filters.source).toBe('')
    expect(store.currentPage).toBe(1)
    expect(store.pageSize).toBe(20)
  })

  it('setFilters 合并部分筛选更新', () => {
    const store = useProblemStore()
    store.setFilters({ keyword: '背包' })
    expect(store.filters.keyword).toBe('背包')
    // 其他字段应保持不变
    expect(store.filters.difficulty).toEqual([])
  })

  it('resetFilters 清空所有筛选条件', () => {
    const store = useProblemStore()
    store.setFilters({
      keyword: '搜索',
      difficulty: ['entry'],
      tags: ['DP'],
      source: '洛谷',
    })
    store.resetFilters()
    expect(store.filters.keyword).toBe('')
    expect(store.filters.difficulty).toEqual([])
    expect(store.filters.tags).toEqual([])
    expect(store.filters.source).toBe('')
    expect(store.currentPage).toBe(1)
  })

  it('fetchProblems 加载题目列表', async () => {
    const store = useProblemStore()
    await store.fetchProblems()
    expect(store.problemList.length).toBe(2)
    expect(store.total).toBe(2)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchProblems 设置 loading 状态', async () => {
    const store = useProblemStore()
    const promise = store.fetchProblems()
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
  })

  it('fetchProblemDetail 加载题目详情', async () => {
    const store = useProblemStore()
    await store.fetchProblemDetail(1001)
    expect(store.currentProblem).not.toBeNull()
    expect(store.currentProblem!.id).toBe(1001)
    expect(store.currentProblem!.title).toBe('测试题目')
    expect(store.detailLoading).toBe(false)
  })

  it('fetchProblemDetail 处理 404', async () => {
    const store = useProblemStore()
    await store.fetchProblemDetail(99999)
    expect(store.currentProblem).toBeNull()
    expect(store.detailError).toBe('题目未找到')
  })

  it('setPage 更新当前页码', () => {
    const store = useProblemStore()
    store.setPage(3)
    expect(store.currentPage).toBe(3)
  })

  it('setPageSize 更新每页条数并重置页码', () => {
    const store = useProblemStore()
    store.setPage(5)
    store.setPageSize(50)
    expect(store.pageSize).toBe(50)
    expect(store.currentPage).toBe(1)
  })

  it('updateSorter 更新排序', () => {
    const store = useProblemStore()
    store.updateSorter('id', 'ascend')
    expect(store.sorter.columnKey).toBe('id')
    expect(store.sorter.order).toBe('ascend')
  })

  it('updateSorter 可以取消排序', () => {
    const store = useProblemStore()
    store.updateSorter('id', 'ascend')
    store.updateSorter('', '')
    expect(store.sorter.columnKey).toBe('')
    expect(store.sorter.order).toBe('')
  })
})
