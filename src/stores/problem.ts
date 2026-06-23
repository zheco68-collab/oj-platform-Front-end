import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { Difficulty, Problem, ProblemDetail } from '../types'
import {
  fetchProblems as apiFetchProblems,
  fetchProblemDetail as apiFetchProblemDetail,
} from '../api/problems'
import type { FetchProblemsParams } from '../api/problems'

export const useProblemStore = defineStore('problem', () => {
  // ==================== 筛选条件 ====================
  const filters = reactive({
    id: '',
    keyword: '',
    difficulty: [] as Difficulty[],
    tags: [] as string[],
    source: '',
  })

  // ==================== 列表状态 ====================
  const problemList = ref<Problem[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ==================== 排序状态 ====================
  const sorter = reactive({
    columnKey: '' as string,
    order: '' as 'ascend' | 'descend' | '',
  })

  // ==================== 详情状态 ====================
  const currentProblem = ref<ProblemDetail | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  // ==================== 当前题目 ID ====================
  const currentProblemId = ref<number | null>(null)

  // ==================== 筛选操作 ====================
  function setFilters(partial: Partial<typeof filters>): void {
    Object.assign(filters, partial)
  }

  function resetFilters(): void {
    filters.id = ''
    filters.keyword = ''
    filters.difficulty = []
    filters.tags = []
    filters.source = ''
    currentPage.value = 1
  }

  // ==================== 列表请求 ====================
  async function fetchProblems(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const params: FetchProblemsParams = {
        page: currentPage.value,
        size: pageSize.value,
        keyword: filters.keyword || undefined,
        difficulty: filters.difficulty.length > 0 ? filters.difficulty.join(',') : undefined,
        tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
        source: filters.source || undefined,
        sortField: sorter.columnKey || undefined,
        sortOrder: sorter.order || undefined,
      }

      // 如果填写了 ID，直接精确匹配（也可纳入 keyword 搜索）
      if (filters.id) {
        params.keyword = `P${filters.id}`
      }

      const res = await apiFetchProblems(params)
      problemList.value = res.data.data
      total.value = res.data.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取题目列表失败'
      problemList.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // ==================== 详情请求 ====================
  async function fetchProblemDetail(id: number): Promise<void> {
    detailLoading.value = true
    detailError.value = null
    currentProblemId.value = id
    try {
      const res = await apiFetchProblemDetail(id)
      if (res.code === 404 || !res.data) {
        detailError.value = '题目未找到'
        currentProblem.value = null
      } else {
        currentProblem.value = res.data
      }
    } catch (err) {
      detailError.value = err instanceof Error ? err.message : '获取题目详情失败'
      currentProblem.value = null
    } finally {
      detailLoading.value = false
    }
  }

  // ==================== 分页操作 ====================
  function setPage(page: number): void {
    currentPage.value = page
  }

  function setPageSize(size: number): void {
    pageSize.value = size
    currentPage.value = 1
  }

  function updateSorter(col: string, order: 'ascend' | 'descend' | ''): void {
    sorter.columnKey = col
    sorter.order = order
  }

  return {
    // 筛选
    filters,
    setFilters,
    resetFilters,
    // 列表
    problemList,
    total,
    currentPage,
    pageSize,
    loading,
    error,
    // 排序
    sorter,
    updateSorter,
    // 详情
    currentProblem,
    currentProblemId,
    detailLoading,
    detailError,
    // 操作
    fetchProblems,
    fetchProblemDetail,
    setPage,
    setPageSize,
  }
})
