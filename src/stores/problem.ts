import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { Difficulty } from '../types'

export const useProblemStore = defineStore('problem', () => {
  // 筛选条件缓存
  const filters = reactive({
    keyword: '',
    difficulty: [] as Difficulty[],
    tags: [] as string[],
    source: '',
  })

  // 当前浏览的题目
  const currentProblemId = ref<number | null>(null)

  function setFilters(partial: Partial<typeof filters>): void {
    Object.assign(filters, partial)
  }

  function resetFilters(): void {
    filters.keyword = ''
    filters.difficulty = []
    filters.tags = []
    filters.source = ''
  }

  return {
    filters,
    currentProblemId,
    setFilters,
    resetFilters,
  }
})
