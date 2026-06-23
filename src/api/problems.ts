/**
 * 题目相关 API
 */
import type { Problem, ProblemDetail, PaginatedResponse, ApiResponse } from '../types'
import { mockProblems, mockProblemDetailMap } from './mock/problems'

/** 模拟网络延迟 (300-800ms) */
function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 300 + Math.random() * 500))
}

export interface FetchProblemsParams {
  page: number
  size: number
  keyword?: string
  difficulty?: string
  tags?: string
  source?: string
  sortField?: string
  sortOrder?: string
}

export async function fetchProblems(
  params: FetchProblemsParams,
): Promise<ApiResponse<PaginatedResponse<Problem>>> {
  await delay()

  let filtered = [...mockProblems]

  const { page, size, keyword, difficulty, tags, source, sortField, sortOrder } = params

  // 关键词过滤（模糊匹配标题）
  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        `P${p.id}`.toLowerCase().includes(kw) ||
        p.id.toString().includes(kw),
    )
  }

  // 难度过滤（逗号分隔，OR 匹配）
  if (difficulty) {
    const diffs = difficulty.split(',').filter(Boolean)
    if (diffs.length > 0) {
      filtered = filtered.filter((p) => diffs.includes(p.difficulty))
    }
  }

  // 标签过滤（逗号分隔，AND 匹配）
  if (tags) {
    const tagList = tags.split(',').filter(Boolean)
    if (tagList.length > 0) {
      filtered = filtered.filter((p) =>
        tagList.every((tag) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())),
      )
    }
  }

  // 来源过滤
  if (source) {
    filtered = filtered.filter((p) => p.source === source)
  }

  // 排序
  if (sortField) {
    const order = sortOrder === 'descend' ? -1 : 1
    filtered.sort((a, b) => {
      let va: number, vb: number
      switch (sortField) {
        case 'id':
          va = a.id
          vb = b.id
          break
        case 'difficulty': {
          const diffOrder = ['entry', 'popularize', 'improve', 'provincial', 'NOI']
          va = diffOrder.indexOf(a.difficulty)
          vb = diffOrder.indexOf(b.difficulty)
          break
        }
        case 'passRate':
          va = a.submissionCount > 0 ? a.acceptedCount / a.submissionCount : 0
          vb = b.submissionCount > 0 ? b.acceptedCount / b.submissionCount : 0
          break
        default:
          va = a.id
          vb = b.id
      }
      return (va - vb) * order
    })
  }

  const total = filtered.length
  // 分页
  const start = (page - 1) * size
  const paged = filtered.slice(start, start + size)

  return {
    code: 200,
    message: 'ok',
    data: {
      data: paged,
      total,
      page,
      size,
    },
  }
}

export async function fetchProblemDetail(
  id: number,
): Promise<ApiResponse<ProblemDetail | null>> {
  await delay()

  const detail = mockProblemDetailMap[id]
  if (!detail) {
    return {
      code: 404,
      message: 'Problem not found',
      data: null,
    }
  }

  return {
    code: 200,
    message: 'ok',
    data: detail,
  }
}
