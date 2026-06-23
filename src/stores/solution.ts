/**
 * 题解状态管理
 */
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type { SolutionSummary, SolutionDetail, Comment } from '../types'
import {
  fetchSolutionsByProblem,
  fetchAllSolutions,
  fetchSolutionDetail,
  voteSolution,
  postComment,
  postReply,
} from '../api/solutions'
import { useAuthStore } from './auth'

export const useSolutionStore = defineStore('solution', () => {
  // ==================== 列表状态 ====================

  const list = ref<SolutionSummary[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')

  const filters = reactive({
    problemId: 0,
    sort: 'time' as 'like' | 'time',
    page: 1,
    size: 10,
  })

  // ==================== 详情状态 ====================

  const current = ref<SolutionDetail | null>(null)
  const detailLoading = ref(false)
  const detailError = ref('')

  // ==================== 互动状态 ====================

  const voting = ref(false)
  const submittingComment = ref(false)

  // ==================== 计算属性 ====================

  const hasMore = computed(() => filters.page * filters.size < total.value)
  const totalPages = computed(() => Math.ceil(total.value / filters.size) || 1)
  const isLoggedIn = computed(() => {
    const auth = useAuthStore()
    return auth.isLoggedIn
  })

  // ==================== 列表操作 ====================

  async function fetchList(problemId: number): Promise<void> {
    filters.problemId = problemId
    filters.page = 1
    loading.value = true
    error.value = ''

    try {
      const res = await fetchSolutionsByProblem({
        problemId,
        sort: filters.sort,
        page: filters.page,
        size: filters.size,
      })
      list.value = res.data.data
      total.value = res.data.total
    } catch {
      error.value = '加载题解列表失败'
    } finally {
      loading.value = false
    }
  }

  async function changeSort(sort: 'like' | 'time'): Promise<void> {
    filters.sort = sort
    filters.page = 1
    loading.value = true
    error.value = ''

    try {
      const res = await fetchSolutionsByProblem({
        problemId: filters.problemId,
        sort: filters.sort,
        page: 1,
        size: filters.size,
      })
      list.value = res.data.data
      total.value = res.data.total
    } catch {
      error.value = '加载题解列表失败'
    } finally {
      loading.value = false
    }
  }

  async function changePage(page: number): Promise<void> {
    filters.page = page
    loading.value = true
    error.value = ''

    try {
      const res = await fetchSolutionsByProblem({
        problemId: filters.problemId,
        sort: filters.sort,
        page,
        size: filters.size,
      })
      list.value = res.data.data
      total.value = res.data.total
    } catch {
      error.value = '加载题解列表失败'
    } finally {
      loading.value = false
    }
  }

  // ==================== 详情操作 ====================

  async function fetchDetail(id: number): Promise<void> {
    detailLoading.value = true
    detailError.value = ''
    current.value = null

    try {
      const res = await fetchSolutionDetail(id)
      if (!res.data) {
        detailError.value = '题解不存在'
        return
      }
      current.value = res.data
    } catch {
      detailError.value = '加载题解详情失败'
    } finally {
      detailLoading.value = false
    }
  }

  // ==================== 互动操作 ====================

  async function vote(type: 'like' | 'dislike'): Promise<void> {
    if (!current.value) return
    voting.value = true

    try {
      const res = await voteSolution(current.value.id, type)
      if (res.data && current.value) {
        current.value.likeCount = res.data.likeCount
        current.value.dislikeCount = res.data.dislikeCount
      }
    } catch {
      // 投票失败静默处理
    } finally {
      voting.value = false
    }
  }

  async function submitComment(content: string): Promise<Comment | null> {
    if (!current.value) return null
    submittingComment.value = true

    try {
      const res = await postComment(current.value.id, content)
      // mock 层已直接修改数据，此处通过返回 comment 触发响应式更新
      if (res.data) {
        // 强制触发 Vue 响应式（mock 直接 mutate 了 current.value.comments）
        current.value = { ...current.value }
        return res.data
      }
      return null
    } catch {
      return null
    } finally {
      submittingComment.value = false
    }
  }

  async function submitReply(parentCommentId: number, content: string): Promise<Comment | null> {
    if (!current.value) return null
    submittingComment.value = true

    try {
      const res = await postReply(current.value.id, parentCommentId, content)
      // mock 层已直接修改数据，通过展开触发响应式更新
      if (res.data) {
        current.value = { ...current.value }
        return res.data
      }
      return null
    } catch {
      return null
    } finally {
      submittingComment.value = false
    }
  }

  // ==================== 全局题解广场 ====================

  const allList = ref<SolutionSummary[]>([])
  const allTotal = ref(0)
  const allLoading = ref(false)
  const allError = ref('')

  const allFilters = reactive({
    sort: 'time' as 'like' | 'time',
    page: 1,
    size: 10,
    keyword: '',
  })

  const allTotalPages = computed(() => Math.ceil(allTotal.value / allFilters.size) || 1)
  const allHasMore = computed(() => allFilters.page * allFilters.size < allTotal.value)

  async function fetchAllList(keyword?: string): Promise<void> {
    if (keyword !== undefined) {
      allFilters.keyword = keyword
    }
    allFilters.page = 1
    allLoading.value = true
    allError.value = ''

    try {
      const res = await fetchAllSolutions({
        sort: allFilters.sort,
        page: 1,
        size: allFilters.size,
        keyword: allFilters.keyword || undefined,
      })
      allList.value = res.data.data
      allTotal.value = res.data.total
    } catch {
      allError.value = '加载题解列表失败'
    } finally {
      allLoading.value = false
    }
  }

  async function changeAllSort(sort: 'like' | 'time'): Promise<void> {
    allFilters.sort = sort
    allFilters.page = 1
    allLoading.value = true
    allError.value = ''

    try {
      const res = await fetchAllSolutions({
        sort: allFilters.sort,
        page: 1,
        size: allFilters.size,
        keyword: allFilters.keyword || undefined,
      })
      allList.value = res.data.data
      allTotal.value = res.data.total
    } catch {
      allError.value = '加载题解列表失败'
    } finally {
      allLoading.value = false
    }
  }

  async function changeAllPage(page: number): Promise<void> {
    allFilters.page = page
    allLoading.value = true
    allError.value = ''

    try {
      const res = await fetchAllSolutions({
        sort: allFilters.sort,
        page,
        size: allFilters.size,
        keyword: allFilters.keyword || undefined,
      })
      allList.value = res.data.data
      allTotal.value = res.data.total
    } catch {
      allError.value = '加载题解列表失败'
    } finally {
      allLoading.value = false
    }
  }

  function reset(): void {
    list.value = []
    total.value = 0
    loading.value = false
    error.value = ''
    current.value = null
    detailLoading.value = false
    detailError.value = ''
    filters.page = 1
    filters.sort = 'time'
  }

  return {
    // 列表
    list,
    total,
    loading,
    error,
    filters,
    hasMore,
    totalPages,
    // 详情
    current,
    detailLoading,
    detailError,
    // 互动
    voting,
    submittingComment,
    isLoggedIn,
    // 操作
    fetchList,
    changeSort,
    changePage,
    fetchDetail,
    vote,
    submitComment,
    submitReply,
    reset,
    // 全局广场
    allList,
    allTotal,
    allLoading,
    allError,
    allFilters,
    allTotalPages,
    allHasMore,
    fetchAllList,
    changeAllSort,
    changeAllPage,
  }
})
