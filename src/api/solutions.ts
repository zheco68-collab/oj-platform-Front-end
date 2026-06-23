/**
 * 题解相关 API
 */
import type { SolutionSummary, SolutionDetail, Comment, PaginatedResponse, ApiResponse } from '../types'
import { mockSolutions, getSolutionDetail, updateSolutionVote, addComment } from './mock/solutions'

/** 模拟网络延迟 (200-500ms) */
function delay(ms?: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))
}

export interface FetchSolutionsParams {
  problemId: number
  page: number
  size: number
  sort?: 'like' | 'time'
}

/** 获取某个题目的题解列表 */
export async function fetchSolutionsByProblem(
  params: FetchSolutionsParams,
): Promise<ApiResponse<PaginatedResponse<SolutionSummary>>> {
  await delay()

  const { problemId, page, size, sort = 'time' } = params

  // 按 problemId 过滤
  let filtered = mockSolutions.filter((s) => s.problemId === problemId)

  // 排序
  if (sort === 'like') {
    filtered.sort((a, b) => b.likeCount - a.likeCount)
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const total = filtered.length
  const start = (page - 1) * size
  const paged = filtered.slice(start, start + size)

  return {
    code: 200,
    message: 'ok',
    data: { data: paged, total, page, size },
  }
}

/** 获取题解详情 */
export async function fetchSolutionDetail(id: number): Promise<ApiResponse<SolutionDetail | null>> {
  await delay(300 + Math.random() * 400)

  const detail = getSolutionDetail(id)
  if (!detail) {
    return { code: 404, message: 'Solution not found', data: null }
  }

  return { code: 200, message: 'ok', data: detail }
}

/** 点赞 / 点踩 */
export async function voteSolution(
  id: number,
  type: 'like' | 'dislike',
): Promise<ApiResponse<{ likeCount: number; dislikeCount: number } | null>> {
  await delay(100 + Math.random() * 150)

  const updated = updateSolutionVote(id, type)
  if (!updated) {
    return { code: 404, message: 'Solution not found', data: null }
  }

  return {
    code: 200,
    message: 'ok',
    data: { likeCount: updated.likeCount, dislikeCount: updated.dislikeCount },
  }
}

/** 发表评论 */
export async function postComment(
  solutionId: number,
  content: string,
): Promise<ApiResponse<Comment | null>> {
  await delay(150 + Math.random() * 200)

  if (!content.trim()) {
    return { code: 400, message: 'Comment content is empty', data: null }
  }

  const comment = addComment(solutionId, 0, 'CurrentUser', content)
  if (!comment) {
    return { code: 404, message: 'Solution not found', data: null }
  }

  return { code: 200, message: 'ok', data: comment }
}

export interface FetchAllSolutionsParams {
  page: number
  size: number
  sort?: 'like' | 'time'
  keyword?: string
}

/** 获取全站题解列表（题解广场） */
export async function fetchAllSolutions(
  params: FetchAllSolutionsParams,
): Promise<ApiResponse<PaginatedResponse<SolutionSummary>>> {
  await delay()

  const { page, size, sort = 'time', keyword } = params

  let filtered = [...mockSolutions]

  // 关键词过滤（标题 + 题目名）
  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(kw) ||
        s.problemTitle.toLowerCase().includes(kw) ||
        s.author.username.toLowerCase().includes(kw),
    )
  }

  // 排序
  if (sort === 'like') {
    filtered.sort((a, b) => b.likeCount - a.likeCount)
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const total = filtered.length
  const start = (page - 1) * size
  const paged = filtered.slice(start, start + size)

  return {
    code: 200,
    message: 'ok',
    data: { data: paged, total, page, size },
  }
}

/** 回复评论 */
export async function postReply(
  solutionId: number,
  parentCommentId: number,
  content: string,
): Promise<ApiResponse<Comment | null>> {
  await delay(150 + Math.random() * 200)

  if (!content.trim()) {
    return { code: 400, message: 'Reply content is empty', data: null }
  }

  const reply = addComment(solutionId, 0, 'CurrentUser', content, parentCommentId)
  if (!reply) {
    return { code: 404, message: 'Solution or comment not found', data: null }
  }

  return { code: 200, message: 'ok', data: reply }
}
