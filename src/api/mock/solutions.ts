/**
 * 题解 Mock 数据
 */
import type { SolutionSummary, SolutionDetail, Comment } from '../../types'
import solutionsData from './data/solutions.json'
import detailsData from './data/solution-details.json'

// ==================== 列表数据 ====================

export const mockSolutions: SolutionSummary[] = solutionsData as SolutionSummary[]

// ==================== 详情数据（内部可变副本） ====================

const mockSolutionDetailMap: Record<number, SolutionDetail> = {}

function initDetails(): void {
  for (const [key, value] of Object.entries(detailsData)) {
    mockSolutionDetailMap[Number(key)] = value as unknown as SolutionDetail
  }
}
initDetails()

// ==================== 查询函数 ====================

/** 获取题解详情 */
export function getSolutionDetail(id: number): SolutionDetail | undefined {
  return mockSolutionDetailMap[id]
}

/** 获取所有题解详情 ID 列表 */
export function getSolutionDetailIds(): number[] {
  return Object.keys(mockSolutionDetailMap).map(Number)
}

// ==================== 修改函数（直接修改内部状态） ====================

/** 更新题解点赞/点踩 */
export function updateSolutionVote(id: number, type: 'like' | 'dislike'): SolutionDetail | undefined {
  const detail = mockSolutionDetailMap[id]
  if (!detail) return undefined
  if (type === 'like') detail.likeCount++
  else detail.dislikeCount++
  return detail
}

/** 添加评论（直接修改内部状态） */
export function addComment(
  solutionId: number,
  authorId: number,
  authorUsername: string,
  content: string,
  parentCommentId?: number,
): Comment | undefined {
  const detail = mockSolutionDetailMap[solutionId]
  if (!detail) return undefined

  const newComment: Comment = {
    id: Date.now(),
    author: { id: authorId, username: authorUsername, avatarUrl: '' },
    content,
    createdAt: new Date().toISOString(),
    replies: [],
  }

  if (parentCommentId) {
    // 回复：添加到父评论的 replies 中
    const findAndReply = (comments: Comment[]): boolean => {
      for (const c of comments) {
        if (c.id === parentCommentId) {
          c.replies.push(newComment)
          return true
        }
        if (findAndReply(c.replies)) return true
      }
      return false
    }
    if (!findAndReply(detail.comments)) {
      // 父评论不存在，作为顶级评论
      detail.comments.push(newComment)
    }
  } else {
    detail.comments.push(newComment)
  }

  return newComment
}
